import { BaseComponent } from 'primeng/basecomponent';
import { BaseStyle } from 'primeng/base';
import * as i0 from '@angular/core';

/**
 *
 * [Live Demo](https://www.primeng.org/)
 *
 * @module baseiconstyle
 *
 */
declare enum BaseIconClasses {
    root = "p-icon"
}
declare class BaseIconStyle extends BaseStyle {
    name: string;
    css: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseIconStyle, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BaseIconStyle>;
}
interface BaseIconStyle extends BaseStyle {
}

declare class BaseIcon extends BaseComponent {
    spin: boolean;
    _componentStyle: BaseIconStyle;
    getClassNames(): string | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseIcon, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BaseIcon, "ng-component", never, { "spin": { "alias": "spin"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_spin: unknown;
}

export { BaseIcon, BaseIconClasses, BaseIconStyle };
