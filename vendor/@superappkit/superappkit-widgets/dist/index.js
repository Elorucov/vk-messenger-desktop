import * as React from 'react';
import { Informer } from './widgets/Informer/Informer';
import { Scroll } from './widgets/Scroll/Scroll';
import { Internal } from './widgets/Internal/Internal';
import { Counter } from './widgets/Counter/Counter';
import { Card } from './widgets/Card/Card';
import { Grid } from './widgets/Grid/Grid';
import { Placeholder } from './widgets/Placeholder/Placeholder';
import { Table } from './widgets/Table/Table';
import { ActionContext } from './common/Action/ActionVkui';
const UNIVERSAL_SCROLL = 'universal_scroll';
const UNIVERSAL_INFORMER = 'universal_informer';
const UNIVERSAL_CARD = 'universal_card';
const UNIVERSAL_COUNTER = 'universal_counter';
const UNIVERSAL_GRID = 'universal_grid';
const UNIVERSAL_TABLE = 'universal_table';
const UNIVERSAL_PLACEHOLDER = 'universal_placeholder';
const UNIVERSAL_INTERNAL = 'universal_internal';
export const supportedWidgets = [
    UNIVERSAL_SCROLL,
    UNIVERSAL_INFORMER,
    UNIVERSAL_CARD,
    UNIVERSAL_COUNTER,
    UNIVERSAL_GRID,
    UNIVERSAL_TABLE,
    UNIVERSAL_PLACEHOLDER,
    UNIVERSAL_INTERNAL,
];
// @elephizeTarget
export const UniversalWidget = ({ item, mini_apps, games, groups, profiles, onAction, onFormatLink }) => {
    let component = null;
    if (item.type === UNIVERSAL_SCROLL) {
        component = (React.createElement(Scroll, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (item.type === UNIVERSAL_INFORMER) {
        component = (React.createElement(Informer, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (item.type === UNIVERSAL_CARD) {
        component = (React.createElement(Card, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (item.type === UNIVERSAL_COUNTER) {
        component = (React.createElement(Counter, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (item.type === UNIVERSAL_GRID) {
        component = (React.createElement(Grid, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (item.type === UNIVERSAL_TABLE) {
        component = (React.createElement(Table, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (item.type === UNIVERSAL_PLACEHOLDER) {
        component = (React.createElement(Placeholder, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (item.type === UNIVERSAL_INTERNAL) {
        component = (React.createElement(Internal, { mini_apps: mini_apps, games: games, groups: groups, profiles: profiles, item: item }));
    }
    if (component) {
        return window._elephizeIsServer ?
            component :
            React.createElement(ActionContext.Provider, { value: {
                    meta: { mini_apps, games, groups, profiles },
                    onAction: onAction,
                    onFormatLink: onFormatLink,
                } }, component);
    }
    return null;
};
//# sourceMappingURL=index.js.map