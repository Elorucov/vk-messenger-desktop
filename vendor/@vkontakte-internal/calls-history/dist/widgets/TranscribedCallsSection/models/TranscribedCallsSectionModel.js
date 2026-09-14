import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, runInAction } from 'mobx';
import { getBlockTitle, mapTranscriptionToItem } from '../helpers';
import { CallsApi, Langs } from '@vkontakte-internal/plugins';
import { createProvider, scope, init } from '@vkontakte-internal/di';
import { handlePromiseError } from '../../../helpers/logger';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
const INITIAL_COUNT = 20;
const CHUNK_SIZE = 10;
let TranscribedCallsSectionModel = class TranscribedCallsSectionModel {
    constructor(callsApi, langs, rightMenuSpinnerService) {
        this.callsApi = callsApi;
        this.langs = langs;
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.items = [];
        this.totalCount = 0;
        this._loading = false;
        this.deleteLoading = false;
        this.loadAsrTranscriptions = async (count, offset) => {
            try {
                const data = await this.callsApi.getAsrTranscriptions({ count, offset });
                runInAction(() => {
                    this.totalCount = data.count;
                    const newItems = data.items.map((item) => mapTranscriptionToItem(item, this.langs.getLang.bind(this.langs), this.langs.langReplace.bind(this.langs), this.langs.locale));
                    this.items = [...this.items, ...newItems];
                });
            }
            catch (error) {
                handlePromiseError(error);
            }
        };
        this.loadMore = async () => {
            this.setLoading(true);
            await this.loadAsrTranscriptions(CHUNK_SIZE, this.items.length);
            this.setLoading(false);
        };
        makeAutoObservable(this);
    }
    get loading() {
        return this._loading;
    }
    setLoading(value) {
        this._loading = value;
    }
    get hasNext() {
        return this.items.length < this.totalCount && this.totalCount > CHUNK_SIZE;
    }
    get blocks() {
        const blocks = new Map();
        this.items.forEach((transcription) => {
            const title = getBlockTitle(this.langs.getLang.bind(this.langs), this.langs.langReplace.bind(this.langs), transcription.date);
            if (!blocks.has(title)) {
                const transcriptions = new Set();
                transcriptions.add(transcription);
                blocks.set(title, transcriptions);
            }
            else {
                blocks.get(title).add(transcription);
            }
        });
        return [...blocks.entries()].map(([title, transcriptions]) => ({
            title,
            transcriptions: [...transcriptions.values()],
        }));
    }
    get isEmpty() {
        return this.blocks.length === 0;
    }
    get isShowSkeleton() {
        return this.loading && this.isEmpty;
    }
    async [init]() {
        this.setLoading(true);
        await this.loadAsrTranscriptions(INITIAL_COUNT, 0);
        this.setLoading(false);
        this.rightMenuSpinnerService.hide();
    }
    async deleteTranscription(docId) {
        if (this.deleteLoading)
            return;
        this.deleteLoading = true;
        try {
            await this.callsApi.deleteAsrTranscriptions({ doc_ids: docId });
            runInAction(() => {
                this.items = this.items.filter((item) => item.doc_id !== docId);
                this.totalCount--;
            });
        }
        catch (error) {
            handlePromiseError(error);
        }
        finally {
            runInAction(() => {
                this.deleteLoading = false;
            });
        }
    }
    downloadTranscription(url) {
        const a = document.createElement('a');
        a.href = url;
        a.click();
    }
};
TranscribedCallsSectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CallsApi,
        Langs,
        RightMenuSpinnerService])
], TranscribedCallsSectionModel);
export const { Provider: TranscribedCallsSectionModelProvider, useModel: useTranscribedCallsSectionModel } = createProvider(TranscribedCallsSectionModel);
//# sourceMappingURL=TranscribedCallsSectionModel.js.map