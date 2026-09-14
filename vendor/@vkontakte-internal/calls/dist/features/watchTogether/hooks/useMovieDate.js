import { getAgeDiff } from '../../../helpers/time';
import { useLang } from '../../../hooks/useLang';
export const useMovieDate = (date) => {
    const { getLang } = useLang();
    let dateString = '';
    if (date) {
        const { years, months, days, hours, minutes, seconds } = getAgeDiff(date);
        switch (true) {
            case !!years:
                dateString = getLang('calls_movie_date_added_years', years);
                break;
            case !!months:
                dateString = getLang('calls_movie_date_added_months', months);
                break;
            case !!days:
                dateString = getLang('calls_movie_date_added_days', days);
                break;
            case !!hours:
                dateString = getLang('calls_movie_date_added_hours', hours);
                break;
            case !!minutes:
                dateString = getLang('calls_movie_date_added_minutes', minutes);
                break;
            case !!seconds:
                dateString = getLang('calls_movie_date_added_seconds', seconds);
                break;
        }
    }
    return dateString;
};
//# sourceMappingURL=useMovieDate.js.map