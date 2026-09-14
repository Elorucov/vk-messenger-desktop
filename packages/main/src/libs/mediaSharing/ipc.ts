import { ipcMain } from 'electron'
import { CapturerSourceData, MediaSharingChannels } from 'vkme-common'
import { mediaSharingWindows } from './mediaSharingWindows'
import { exec } from 'child_process'

ipcMain?.handle(
  MediaSharingChannels.SET_SOURCE,
  (_, source: CapturerSourceData) => mediaSharingWindows.setSource(source),
)

ipcMain?.handle(
  MediaSharingChannels.CREATE_PULSE_AUDIO_SOURCE,
  () =>
    new Promise<void>((res) => {
      // Создание виртуального микрофона в который перенаправляется весь системный звук
      exec(
        `
      SOURCE_LABEL=VK-MESSENGER-SHARE-AUDIO

      # Проверяем существует ли виртуальный микрофон с лэйблом VK-MESSENGER-SHARE-AUDIO 
      if ! pactl list sources | grep -q $SOURCE_LABEL; then
  
        # Запрашиваем приемник по умолчанию (весь системный звук)
        DEFAULT_SINK=$(pacmd stat | awk '/^Default sink name: /{print $4}')
        
        if [ -z "$DEFAULT_SINK" ]; then
          # Запрашиваем приемник по умолчанию если не сработал первый способ (Fedora)
          DEFAULT_SINK=$(pactl get-default-sink)
        fi
        
        if [ -n "$DEFAULT_SINK" ]; then
          # Создаем виртуальный микрофон и перенаправляем в него весь звук с дефолтного приемника
          pactl load-module module-remap-source master=$DEFAULT_SINK.monitor source_properties=device.description=$SOURCE_LABEL
        fi

      fi

      exit 0
      `,
        () => res(),
      )
    }),
)
