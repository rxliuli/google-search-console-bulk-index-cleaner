import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  toggle(): void
}

export const { sendMessage, onMessage, removeAllListeners } =
  defineExtensionMessaging<ProtocolMap>()
