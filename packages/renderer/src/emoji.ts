import {
  VmojiGetAvatarParams,
  VmojiAvatar,
  VmojiGetAvatarResponse,
} from '@vkontakte-internal/api-schema-typescript'
import { IApi } from '@vkontakte-internal/messenger'

let _vmojiAvatarCache: VmojiAvatar | null = null

type EmojiConfig = {
  getVmojiAvatar: (avatarId?: string) => Promise<VmojiAvatar | null>
  showVmojiAvatar: () => void
  createVmojiAvatar: () => void
}

export const getEmojiConfig = (
  api: IApi.IApi['fetchForExternalLibs'],
): EmojiConfig => ({
  getVmojiAvatar: (avatarId?: string): Promise<VmojiAvatar | null> => {
    const params: VmojiGetAvatarParams = {}

    if (avatarId) {
      Object.assign(params, {
        avatar_id: avatarId,
      })
    }

    if (_vmojiAvatarCache !== null) {
      return Promise.resolve(_vmojiAvatarCache)
    }

    return api('vmoji.getAvatar', params).then(
      ({ avatar }: VmojiGetAvatarResponse) => {
        _vmojiAvatarCache = avatar || null
        return _vmojiAvatarCache
      },
    )
  },
  showVmojiAvatar: () => {
    window._calls.editVmoji()
  },
  createVmojiAvatar: () => {
    window._calls.editVmoji()
  },
})
