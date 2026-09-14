export function isToday(date) {
    const now = new Date();
    return (date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate());
}
export const isSameYear = (a, b) => {
    return a.getFullYear() === b.getFullYear();
};
const ONE_KB = 2 ** 10;
const ONE_MB = 2 ** 20;
const ONE_GB = 2 ** 30;
export const getFormattedSize = (size, getLang, langReplace) => {
    if (!size) {
        return '';
    }
    switch (true) {
        case size >= ONE_GB: {
            return langReplace(getLang('calls_decoded_page_doc_size_gb'), {
                size: String(Number((size / ONE_GB).toFixed(1))),
            });
        }
        case size >= ONE_MB: {
            return langReplace(getLang('calls_decoded_page_doc_size_mb'), {
                size: String(Number((size / ONE_MB).toFixed(1))),
            });
        }
        case size >= ONE_KB: {
            return langReplace(getLang('calls_decoded_page_doc_size_kb'), {
                size: String(Math.round(size / ONE_KB)),
            });
        }
        default: {
            return langReplace(getLang('calls_decoded_page_doc_size_kb'), {
                size: String(Number((size / ONE_KB).toFixed(1))),
            });
        }
    }
};
export const getTimeTitle = (getLang, langReplace, date, locale) => {
    const docDate = new Date(date * 1000);
    const formatter = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
    });
    const time = formatter.format(docDate);
    return langReplace(getLang('global_calls_decoded_page_in_time'), { time });
};
export function mapTranscriptionToItem(transcription, getLang, langReplace, locale) {
    return {
        ...transcription,
        subtitle: getSubtitle({ getLang, langReplace, transcription, locale }),
    };
}
export function getSubtitle({ getLang, langReplace, transcription, locale }) {
    const time = transcription.doc_url ? getTimeTitle(getLang, langReplace, transcription.date, locale) : '';
    const size = getFormattedSize(transcription.doc_size, getLang, langReplace);
    return [time, size, transcription.chat?.title].filter((value) => !!value).join(' \u00B7 ');
}
export const getBlockTitle = (getLang, langReplace, date) => {
    const transcriptionDate = new Date(date * 1000);
    const day = String(transcriptionDate.getDate());
    const month = getMonthTitle(getLang, transcriptionDate.getMonth());
    const year = String(transcriptionDate.getFullYear());
    if (isToday(transcriptionDate)) {
        return getLang('calls_decoded_page_date_today');
    }
    return isSameYear(transcriptionDate, new Date())
        ? langReplace(getLang('calls_decoded_page_date'), { day, month })
        : langReplace(getLang('calls_decoded_page_date_full'), { day, month, year });
};
function getMonthTitle(getLang, month) {
    switch (month) {
        case 0:
            return getLang('calls_decoded_page_date_january');
        case 1:
            return getLang('calls_decoded_page_date_february');
        case 2:
            return getLang('calls_decoded_page_date_march');
        case 3:
            return getLang('calls_decoded_page_date_april');
        case 4:
            return getLang('calls_decoded_page_date_may');
        case 5:
            return getLang('calls_decoded_page_date_june');
        case 6:
            return getLang('calls_decoded_page_date_july');
        case 7:
            return getLang('calls_decoded_page_date_august');
        case 8:
            return getLang('calls_decoded_page_date_september');
        case 9:
            return getLang('calls_decoded_page_date_october');
        case 10:
            return getLang('calls_decoded_page_date_november');
        case 11:
            return getLang('calls_decoded_page_date_december');
        default:
            return '';
    }
}
//# sourceMappingURL=helpers.js.map