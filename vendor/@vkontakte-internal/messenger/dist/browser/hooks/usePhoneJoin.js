import React, { useCallback, useState } from 'react';
import { PhoneInviteModal } from '../ui/PhoneInviteModal/PhoneInviteModal';
import * as Peer from '../../core/model/Peer';
import * as Viewer from '../../core/model/Viewer';
import { useBrowserEnv, useInsertIntoCache, useViewer } from './misc';
import { useImportContact } from '../ui/ImportContactModal/useImportContact';
import { fromApiContact } from '../../data/converter/PeerConverter';
import { useApiFetch } from '../hooks/useApiFetch';
export function usePhoneJoin({ onClose, onSuccess, onError, onMyNumberEntered, peerId, }) {
    const { lang } = useBrowserEnv();
    const { importContact } = useImportContact();
    const insertIntoCache = useInsertIntoCache();
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { profileType } = useViewer();
    const apiFetch = useApiFetch();
    const isEdu = Viewer.isEdu(profileType);
    const handleClose = useCallback(() => {
        onClose();
        setLoading(false);
        setError('');
    }, [onClose]);
    const handleErrorReset = useCallback(() => setError(''), []);
    const handleSubmit = useCallback(async (phone) => {
        setLoading(true);
        let contact;
        try {
            const importedContact = await importContact({
                phone,
                name: '',
                withExisting: true,
            });
            // Не смогли найти пользователя с таким номером
            if (importedContact.hasFailed) {
                setError(importedContact.isMyPhoneNumber
                    ? lang.use('me_phone_invite_error_already_exists')
                    : lang.use(isEdu
                        ? 'me_phone_invite_error_not_found_edu'
                        : 'me_phone_invite_error_not_found'));
                if (importedContact.isMyPhoneNumber && onMyNumberEntered) {
                    onMyNumberEntered();
                }
                return;
            }
            insertIntoCache({
                contacts: [importedContact.contact],
                profiles: importedContact.profile
                    ? [importedContact.profile]
                    : undefined,
            });
            contact = fromApiContact(importedContact.contact);
            if (peerId && Peer.isChatPeerId(peerId)) {
                await apiFetch('messages.addChatUser', {
                    peer_id: contact.id,
                    chat_id: Peer.toRealId(peerId),
                    source: 'phone',
                });
            }
            onSuccess(contact.id);
        }
        catch (e) {
            onError?.(e, contact);
        }
        finally {
            setLoading(false);
        }
    }, [
        apiFetch,
        importContact,
        insertIntoCache,
        lang,
        onError,
        onSuccess,
        onMyNumberEntered,
        peerId,
        isEdu,
    ]);
    const isInvite = peerId !== undefined;
    return {
        modal: (React.createElement(PhoneInviteModal, { onClose: handleClose, onSubmit: handleSubmit, onErrorReset: handleErrorReset, error: error, isLoading: isLoading, title: lang.use(isInvite ? 'me_phone_invite_title' : 'me_phone_write_title'), subtitle: lang.use(isInvite ? 'me_phone_invite_subtitle' : 'me_phone_write_subtitle'), action: lang.use(isInvite ? 'me_phone_invite_action' : 'me_phone_write_action'), focusOnMount: true })),
    };
}
//# sourceMappingURL=usePhoneJoin.js.map