import { useDeviceId } from '../../hooks/misc';
import { useCallback, useState } from 'react';
import { useApiFetch } from '../../hooks/useApiFetch';
export const useImportContact = () => {
    const apiFetch = useApiFetch();
    const deviceId = useDeviceId();
    const [isLoading, setLoading] = useState(false);
    const importContact = useCallback(async ({ phone, name, surname, withExisting }) => {
        setLoading(true);
        const fullname = surname ? name + ' ' + surname : name;
        const response = await apiFetch('account.importMessagesContacts', {
            contacts: JSON.stringify([
                {
                    phones: [phone],
                    name: fullname,
                },
            ]),
            //TODO: Убрать когда добавят with_existing и existin в типы
            //@ts-expect-error Argument of type '{ contacts: string; with_existing: boolean; extended: 1; device_id: string; }' is not assignable to parameter of type 'AccountImportMessagesContactsParams & { extended: 0 | 1; fields?: undefined; }'.
            with_existing: Boolean(withExisting),
            extended: 1,
            device_id: deviceId,
        });
        // Контакт не был добавлен или найден в существующих, значит пользователя не существует/произошла ошибка
        if ((response.items.synced.length === 0 &&
            //@ts-expect-error Property 'existing' does not exist on type 'MessagesImportObject'.
            response.items.existing.length === 0) ||
            !response.contacts?.[0]) {
            return {
                hasFailed: true,
                isMyPhoneNumber: response.items.has_my_phone_number,
            };
        }
        setLoading(false);
        return {
            items: response.items,
            profile: response.profiles?.[0],
            contact: response.contacts[0],
            hasFailed: false,
        };
    }, [apiFetch, deviceId]);
    return {
        isLoading,
        importContact,
    };
};
//# sourceMappingURL=useImportContact.js.map