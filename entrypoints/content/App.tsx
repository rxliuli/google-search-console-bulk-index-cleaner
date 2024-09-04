import { useEffectOnce, useLocalStorage } from 'react-use'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { useToast } from './components/ui/use-toast'
import { Progress } from './components/ui/progress'
import { Textarea } from './components/ui/textarea'
import { parse } from 'csv-parse/browser/esm/sync'
import { onMessage, removeAllListeners } from '../model/messaging'
import { InfoIcon, Loader2Icon } from 'lucide-react'
import { uniq } from 'lodash-es'
import { ToastAction } from './components/ui/toast'

function wait(
  param?: number | (() => boolean | Promise<boolean>),
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof param === 'number') {
      setTimeout(resolve, param)
    } else if (typeof param === 'function') {
      const timer = setInterval(async () => {
        if (await param()) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
      setTimeout(() => {
        clearInterval(timer)
        reject('timeout')
      }, 10_000)
    } else {
      resolve()
    }
  })
}

const closeAlert = () => {
  const list = [
    ...document.querySelectorAll(
      'div[role="dialog"]:has(> div > [role="heading"])',
    ),
  ].filter((it) => {
    const s = it.querySelector('div > [role="heading"]')?.textContent
    return (
      s?.includes('Duplicate request') || s?.includes('URL not in property')
    )
  })
  if (list.length === 0) {
    return false
  }
  list.forEach((it) => {
    it.querySelector('div[role="button"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
  })
  return true
}

const getDialog = () =>
  document.querySelector('div[role="dialog"]:has(> div > [role="heading"])')

async function submitUrl(url: string) {
  // 如果有弹窗，关闭弹窗
  const $dialog = getDialog()
  if ($dialog) {
    console.log('close dialog')
    $dialog.parentElement?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
  }
  if (!document.querySelector('[aria-label="New Request"]')) {
    console.log('click new request')
    const $requestButton = [
      ...document.querySelectorAll('div > div > span > span'),
    ].find((it) => it.textContent?.includes('New Request'))
    if (!$requestButton) {
      throw new Error('Not found New Request button')
    }
    $requestButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wait(() => !!document.querySelector('[aria-label="New Request"]'))
  }
  console.log('input url')
  const $modal = document.querySelector(
    '[aria-label="New Request"]',
  ) as HTMLElement
  const getEnterURL = () =>
    $modal.querySelector('input[placeholder="Enter URL"]')
  await wait(() => !!getEnterURL())
  await wait(100)
  const $input = getEnterURL()
  if (!$input) {
    throw new Error('Not found input')
  }
  ;($input as HTMLInputElement).value = url
  $input.dispatchEvent(new InputEvent('input', { bubbles: true }))
  console.log('click next')
  const $next = [
    ...$modal.querySelectorAll('div[role="button"]:has(> span > span)'),
  ].find((it) => it.textContent?.includes('Next'))
  if (!$next) {
    throw new Error('Not found Next button')
  }
  $next.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  console.log('click submit')
  await wait(100)
  const getSubmit = () =>
    [
      ...document.querySelectorAll('div[role="button"]:has(> span > span)'),
    ].find((it) => it.textContent?.includes('Submit request'))
  const isContinue = await Promise.race([
    wait(() => !!getSubmit()).then(() => true),
    wait(() => !!closeAlert()).then(() => false),
  ])
  if (!isContinue) {
    return
  }
  const $submit = getSubmit()
  if (!$submit) {
    throw new Error('Not found Submit request button')
  }
  $submit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await wait(() => !getSubmit())
  console.log('click duplicate')

  console.log('before')
  await wait(
    () =>
      !!closeAlert() ||
      !document.querySelector(
        'div[role="dialog"]:has(> div > [role="heading"])',
      ),
  )
  console.log('after')
  closeAlert()
  console.log('click duplicate end')
}

function CleanProgress(props: { url: string; value: number }) {
  return (
    <>
      <h4 className={'flex items-center gap-1'}>
        <Loader2Icon className="animate-spin w-8 h-8" />
        <span>Processing:</span>
        <a href={props.url} target={'_blank'} className={'truncate'}>
          <Button variant={'link'} className={'p-0'}>
            {props.url}
          </Button>
        </a>
      </h4>
      <Progress value={props.value} />
    </>
  )
}

export function App() {
  const [active, onToggle] = useReducer<(p: boolean, a?: boolean) => boolean>(
    (s, action) => action ?? !s,
    false,
  )
  const [_cleanedUrls, setCleanedUrls] = useLocalStorage<string[]>(
    'cleaned-urls',
    [],
  )
  const { toast } = useToast()

  const [urls, setUrls] = useState('')
  useEffectOnce(() => {
    onMessage('toggle', onToggle)
    return removeAllListeners
  })

  async function onSelectedFile(file: File) {
    const tables = parse(await file.text(), {
      columns: true,
      skip_empty_lines: true,
    }) as {
      URL: string
      'Last crawled': string
    }[]
    setUrls(
      tables
        .slice(1)
        .map((it) => it.URL)
        .join('\n'),
    )
  }

  async function onSubmit() {
    const list = urls.trim().split('\n').filter(Boolean)
    let cleanedUrls = uniq(
      JSON.parse(localStorage.getItem('cleaned-urls') ?? '[]'),
    ) as string[]
    console.log('cleanedUrls', cleanedUrls)
    const t = toast({
      title: 'Bulk Index Cleaner',
      description: <CleanProgress url={list[0]} value={0} />,
      key: 'Bulk Index Cleaner',
      duration: Number.POSITIVE_INFINITY,
    })
    try {
      for (const it of list) {
        if (cleanedUrls?.includes(it)) {
          continue
        }
        t.update({
          id: t.id,
          description: (
            <CleanProgress
              url={it}
              value={(list.indexOf(it) / list.length) * 100}
            />
          ),
        })
        await submitUrl(it)
        cleanedUrls.push(it)
        setCleanedUrls([...cleanedUrls])
        await wait(500)
      }
      t.update({
        id: t.id,
        description: (
          <div>
            <h4 className={'flex items-center text-green-400'}>
              <InfoIcon className="mr-2" />
              Processing Complete
            </h4>
          </div>
        ),
        duration: 2000,
      })
    } catch (e) {
      console.error(e)
      t.update({
        id: t.id,
        description: (
          <div>
            <h4 className={'flex items-center text-red-400'}>
              <InfoIcon className="mr-2" />
              Processing Error
            </h4>
          </div>
        ),
        action: (
          <ToastAction
            altText={'Try again'}
            onClick={async () => {
              t.dismiss()
              await onSubmit()
            }}
          >
            Try again
          </ToastAction>
        ),
      })
    }
  }

  return (
    <>
      <Dialog open={active} onOpenChange={onToggle}>
        <DialogTrigger asChild={true}>
          <Button variant={'destructive'} className={'border-2 ml-2'}>
            Batch Remove Index
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bulk-index-cleaner">
          <DialogHeader>
            <DialogTitle>Bluk Index Cleaner</DialogTitle>
            <DialogDescription>
              Remove all indexes from the selected tables
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Remove URLs</Label>
              <Textarea
                value={urls}
                onChange={(ev) => setUrls(ev.target.value)}
                rows={10}
                onWheel={(ev: React.WheelEvent<HTMLTextAreaElement>) => {
                  ev.currentTarget.scrollTop += ev.deltaY
                }}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Upload Table.csv</Label>
              <Input
                id="picture"
                type="file"
                accept={'.csv'}
                onChange={(ev) => onSelectedFile(ev.target.files![0])}
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="submit"
              onClick={async () => {
                onToggle()
                await onSubmit()
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
