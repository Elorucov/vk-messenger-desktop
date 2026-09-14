import '@vkontakte-internal/messenger/dist/browser/ui/SettingsContent/SettingsContent.css'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import {
  Icon24DoorArrowRightOutline,
  Icon24DeleteOutlineAndroid,
  Icon28CameraAddOutline,
  Icon24CheckShieldOutline,
} from '@vkontakte/icons'
import { Button, Separator, Spacing } from '@vkontakte/vkui'

import {
  useBrowserEnv,
  useDispatch,
  useFeatureFlags,
  useViewer,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'

import { ExternalLink } from '@vkontakte-internal/messenger/dist/browser/ui/Link/Link'
import {
  FieldGroup,
  FieldGroupItem,
} from '@vkontakte-internal/messenger/dist/browser/ui/FieldGroup/FieldGroup'
import { AvatarSelector } from '@vkontakte-internal/messenger/dist/browser/ui/AvatarSelector/AvatarSelector'
import { ProfileInfoModal } from '@vkontakte-internal/messenger/dist/browser/ui/ProfileInfo/ProfileInfo'
import { useModal } from '@vkontakte-internal/messenger/dist/browser/hooks/useModal'
import { ModalInterface } from '@vkontakte-internal/messenger/dist/browser/ui/ModalInterface/ModalInterface'
import { SettingsContentAccountForm } from '@vkontakte-internal/messenger/dist/browser/ui/SettingsContentAccountForm/SettingsContentAccountForm'

import * as Folders from '@vkontakte-internal/messenger/dist/core/model/Folder'
import * as Sublist from '@vkontakte-internal/messenger/dist/core/model/Sublist'
import * as Convo from '@vkontakte-internal/messenger/dist/core/model/Convo'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import * as Organisers from '@vkontakte-internal/messenger/dist/core/model/Organisers'
import * as Viewer from '@vkontakte-internal/messenger/dist/core/model/Viewer'
import {
  API_GET_MULTI_FIELDS,
  ID_VK_COM_BASE,
} from '@vkontakte-internal/messenger/dist/core/config/config'

import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'

import {
  fromApiViewerAccount,
  fromApiViewerProfileInfo,
} from '@vkontakte-internal/messenger/dist/data/converter/ViewerConverter'
import { fromApiUser } from '@vkontakte-internal/messenger/dist/data/converter/PeerConverter'
import { State } from '@vkontakte-internal/messenger/dist/data/store/State'
import * as RecommendedFolders from '@vkontakte-internal/messenger/dist/core/model/FolderRecommended'
import { RemoveAccountModal } from '../../../RemoveAccountModal/RemoveAccountModal'
import {
  useApiFetch,
  useApiFetchMany,
} from '@vkontakte-internal/messenger/dist/browser/hooks/useApiFetch'

type Props = {
  route: IRouter.SettingsRoute
  folders: Folders.Folders
  sublists: Sublist.Sublists
  recommendedFolders: RecommendedFolders.FoldersRecommended
  convos: Convo.Cache
  locks: State['locks']
  convoOrganisers: Pick<Organisers.Organisers, 'filters' | 'folders'>
  onLogout: () => Promise<void>
  onNotificationPermissionChange?: () => void
  foldersView: 'auto' | 'vertical' | 'horizontal'
  notificationUnblockPics?: [string, string]
}

export const SettingsAccount: FC<
  React.PropsWithChildren<Pick<Props, 'onLogout'>>
> = ({ onLogout }) => {
  const profileInfoModal = useModal()
  const removeAccountConfirmationModal = useModal()
  const [isAvatarPhotoSaving, setIsAvatarPhotoSaving] = useState(false)
  const [isAvatarPhotoRemoving, setIsAvatarPhotoRemoving] = useState(false)
  const featureFlags = useFeatureFlags()
  const { lang, uploader } = useBrowserEnv()
  const apiFetch = useApiFetch()
  const apiFetchMany = useApiFetchMany()
  const dispatch = useDispatch()
  const {
    viewer,
    profileType,
    profileInfo: {
      phoneNumber,
      id,
      firstName,
      lastName,
      screenName,
      avatarPhoto,
    },
  } = useViewer()
  const isEdu = Viewer.isEdu(profileType)
  const [newAvatarPhoto, setNewAvatarPhoto] = useState<
    { kind: 'current' } | { kind: 'preview'; photo: File }
  >()
  const phone = useMemo(() => phoneNumber?.replace(/\*/g, '•'), [phoneNumber])
  const photoId = useMemo(
    () => viewer.photoId && Number(viewer.photoId),
    [viewer.photoId],
  )

  const refreshProfile = useCallback(async () => {
    try {
      const [profileInfoResponse, usersGetResponse, responseMultiAccount] =
        await apiFetchMany([
          { method: 'account.getProfileInfo', params: {} },
          {
            method: 'users.get',
            params: {
              user_ids: Peer.toRealId(id).toString(),
              extended: 1,
            },
          },
          {
            method: 'account.getMulti',
            params: {
              fields: API_GET_MULTI_FIELDS.join(','),
            },
          },
        ])

      const profileInfo = fromApiViewerProfileInfo(profileInfoResponse)
      const peerFromApi = usersGetResponse[0]
      const { user = undefined } = peerFromApi ? fromApiUser(peerFromApi) : {}

      const accounts = responseMultiAccount.items.map(fromApiViewerAccount)

      dispatch({
        type: 'UserProfileInfo_Update',
        profileInfo,
        user,
        accounts,
      })
    } catch {}
  }, [id, dispatch, apiFetchMany])

  const removeAvatarPhoto = async () => {
    setIsAvatarPhotoRemoving(true)

    try {
      await apiFetch('photos.delete', {
        photo_id: Number(photoId),
        owner_id: id,
      })

      await refreshProfile()
    } catch {
    } finally {
      setIsAvatarPhotoRemoving(false)
    }
  }

  const saveAvatarPhoto = async () => {
    if (newAvatarPhoto?.kind !== 'preview' || !newAvatarPhoto.photo) {
      return
    }

    setIsAvatarPhotoSaving(true)

    try {
      await new Promise((resolve, reject) => {
        uploader.uploadFiles(
          [newAvatarPhoto.photo],
          { asOwnerPhoto: true },
          { viewerId: id },
          {
            onUploadFinish: resolve,
            onError: reject,
          },
        )
      })
      await refreshProfile()
    } catch {
    } finally {
      setIsAvatarPhotoSaving(false)
    }
  }

  const handleAvatarSelect = async (avatar: File) => {
    setNewAvatarPhoto({ kind: 'preview', photo: avatar })
  }

  const handleRemoveAvatar = () => {
    if (newAvatarPhoto?.kind === 'current' && photoId) {
      void removeAvatarPhoto()
    } else if (newAvatarPhoto?.kind === 'preview') {
      setNewAvatarPhoto(avatarPhoto ? { kind: 'current' } : undefined)
    }
  }
  // иногда изменения приходят из вне, например мы переходили в вкид или пришлось откатить изменения (апи отвалилось)
  useEffect(() => {
    setNewAvatarPhoto(avatarPhoto ? { kind: 'current' } : undefined)
  }, [avatarPhoto])

  const handleDeleteAccount = () => {
    removeAccountConfirmationModal.open()
  }

  const handleOpenSecurity = () => {
    window.open(`${ID_VK_COM_BASE}/account/#/security?edu=1}`, '_blank')
  }

  return (
    <>
      {isEdu ? (
        <div className="SettingsContent__avatarContainer">
          <div
            className="SettingsContent__cover"
            style={{
              backgroundImage:
                avatarPhoto?.baseUrl && photoId
                  ? `url(${avatarPhoto?.baseUrl})`
                  : undefined,
            }}
          />
          <div className="SettingsContent__avatar SettingsContent__avatar--floating">
            <AvatarSelector
              isLoading={isAvatarPhotoSaving || isAvatarPhotoRemoving}
              key={avatarPhoto?.baseUrl}
              size={80}
              onSelection={handleAvatarSelect}
              onRemove={handleRemoveAvatar}
              onUpload={saveAvatarPhoto}
              peerId={id}
              isDisabled={isAvatarPhotoSaving || isAvatarPhotoRemoving}
              noImage={<Icon28CameraAddOutline />}
            />
          </div>
        </div>
      ) : (
        <div className="SettingsContent__avatar">
          <AvatarSelector
            isLoading={isAvatarPhotoSaving || isAvatarPhotoRemoving}
            key={avatarPhoto?.baseUrl}
            size={80}
            onSelection={handleAvatarSelect}
            onRemove={handleRemoveAvatar}
            onUpload={saveAvatarPhoto}
            peerId={id}
            isDisabled={isAvatarPhotoSaving || isAvatarPhotoRemoving}
          />
        </div>
      )}

      {isEdu && <SettingsContentAccountForm />}

      <FieldGroup>
        {isEdu ? (
          <FieldGroupItem
            hasActive={true}
            hasHover={true}
            before={<Icon24CheckShieldOutline />}
            onClick={handleOpenSecurity}
          >
            {lang.use('me_security_and_entry')}
          </FieldGroupItem>
        ) : (
          <FieldGroupItem
            subtitle={phone}
            after={
              <Button
                Component={ExternalLink}
                href={`${ID_VK_COM_BASE}/account/#/personal`}
                target="_blank"
                mode="tertiary"
              >
                {lang.use('me_change_in_vkid')}
              </Button>
            }
          >
            {firstName} {lastName}
          </FieldGroupItem>
        )}
        {featureFlags.vkm_profile_info_screen_name ? (
          <>
            <Spacing size={0}>
              <Separator />
            </Spacing>
            <FieldGroupItem
              subtitle={
                <span className="SettingsContent__accent">@{screenName}</span>
              }
              after={
                <Button mode="tertiary" onClick={profileInfoModal.open}>
                  {lang.use('me_edit')}
                </Button>
              }
            >
              {lang.use('me_profile_info_shortname')}
            </FieldGroupItem>
          </>
        ) : null}
      </FieldGroup>
      <FieldGroup>
        <FieldGroupItem
          hasActive={true}
          hasHover={true}
          before={<Icon24DoorArrowRightOutline />}
          onClick={onLogout}
        >
          {isEdu
            ? lang.use('me_edu_account_logout')
            : lang.use('me_account_logout')}
        </FieldGroupItem>
      </FieldGroup>
      <FieldGroup>
        <FieldGroupItem
          hasActive={true}
          hasHover={true}
          before={<Icon24DeleteOutlineAndroid />}
          onClick={handleDeleteAccount}
        >
          {lang.use('me_account_delete')}
        </FieldGroupItem>
      </FieldGroup>
      {profileInfoModal.isActive && (
        <ModalInterface
          onClose={profileInfoModal.close}
          closeLabel={lang.use('me_close')}
          backLabel={lang.use('me_back')}
          title={lang.use('me_account_editing')}
          withCustomLayout
        >
          <ProfileInfoModal
            isVKIDHidden={true}
            onBack={profileInfoModal.close}
          />
        </ModalInterface>
      )}
      {removeAccountConfirmationModal.isActive && (
        <RemoveAccountModal
          onClose={removeAccountConfirmationModal.close}
          onLogout={onLogout}
        />
      )}
    </>
  )
}
