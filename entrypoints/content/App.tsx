import { useEffectOnce, useMount } from 'react-use'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { useToast } from './components/ui/use-toast'
import { Progress } from './components/ui/progress'
import { Textarea } from './components/ui/textarea'
import { parse } from 'csv-parse/browser/esm/sync'
import { wait } from '@liuli-util/async'
import { onMessage, removeAllListeners } from '../model/messaging'
import { InfoIcon, Loader2Icon } from 'lucide-react'

const getDuplicate = () =>
  [
    ...document.querySelectorAll(
      'div[role="dialog"]:has(> div > [role="heading"])',
    ),
  ]
    .find((it) => {
      const s = it.querySelector('div > [role="heading"]')?.textContent
      return (
        s?.includes('Duplicate request') || s?.includes('URL not in property')
      )
    })
    ?.querySelector('[role="button"]')

async function submitUrl(url: string) {
  // 如果有弹窗，关闭弹窗
  const $dialog = document.querySelector(
    'div[role="dialog"]:has(> div > [role="heading"])',
  )
  if ($dialog) {
    $dialog.parentElement?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
  }
  const $requestButton = [
    ...document.querySelectorAll('div > div > span > span'),
  ].find((it) => it.textContent?.includes('New Request'))
  if (!$requestButton) {
    throw new Error('Not found New Request button')
  }
  $requestButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await wait(() => !!document.querySelector('[aria-label="New Request"]'))
  await wait(100)
  const $modal = document.querySelector(
    '[aria-label="New Request"]',
  ) as HTMLElement
  const $input = $modal.querySelector('input[placeholder="Enter URL"]')
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
  await wait(() => !!getSubmit())
  const $submit = getSubmit()
  if (!$submit) {
    throw new Error('Not found Submit request button')
  }
  $submit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await wait(() => !getSubmit())
  console.log('click duplicate')

  console.log('before', getDuplicate())
  await wait(
    () =>
      !!getDuplicate() ||
      !document.querySelector(
        'div[role="dialog"]:has(> div > [role="heading"])',
      ),
  )
  console.log('after', getDuplicate())
  getDuplicate()?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  console.log('click duplicate end')
}

export function App() {
  const [active, onToggle] = useReducer((s) => !s, false)
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

  function CleanProgress(props: { url: string; value: number }) {
    return (
      <div>
        <h4 className={'flex items-center'}>
          <Loader2Icon className="animate-spin mr-2" />
          Processing:{' '}
          <a href={props.url} target={'_blank'}>
            <Button variant={'link'} className={'p-0'}>
              {props.url}
            </Button>
          </a>
        </h4>
        <Progress value={props.value} />
      </div>
    )
  }

  async function onSubmit() {
    onToggle()
    const list = urls.trim().split('\n').filter(Boolean)
    const t = toast({
      title: 'Bulk Index Cleaner',
      description: <CleanProgress url={list[0]} value={0} />,
      key: 'Bulk Index Cleaner',
      duration: Number.POSITIVE_INFINITY,
    })
    for (const it of list) {
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
  }

  return (
    <>
      <Dialog open={active} onOpenChange={onToggle}>
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
            <Button type="submit" onClick={onSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
