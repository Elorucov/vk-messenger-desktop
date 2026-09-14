import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import { noop } from './../../deps/@vkontakte/vkjs/lib/es6/other/functions.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { createContext, useContext } from 'react';
import { lifecycle } from '../../modules/lifecycle/hooks.js';

const HostServiceProviderContext=createContext({lifecycle:lifecycle,handlers:null,ads:null,stats:null,registerHandlersController:noop,registerAdsController:noop});function useHostServiceProviderContext(){return useContext(HostServiceProviderContext)}

export { HostServiceProviderContext, useHostServiceProviderContext };
