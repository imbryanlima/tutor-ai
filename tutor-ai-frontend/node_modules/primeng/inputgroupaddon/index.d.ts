import { BaseComponent } from 'primeng/basecomponent';
import { BaseStyle } from 'primeng/base';
import * as i0 from '@angular/core';
import * as i1 from 'primeng/api';

declare class InputGroupAddonStyle extends BaseStyle {
    name: string;
    classes: {
        root: string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<InputGroupAddonStyle, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<InputGroupAddonStyle>;
}

/**
 * InputGroupAddon displays text, icon, buttons and other content can be grouped next to an input.
 * @group Components
 */
declare class InputGroupAddon extends BaseComponent {
    /**
     * Inline style of the element.
     * @group Props
     */
    style: {
        [klass: string]: any;
    } | null | undefined;
    /**
     * Class of the element.
     * @group Props
     */
    styleClass: string | undefined;
    _componentStyle: InputGroupAddonStyle;
    get hostStyle(): {
        [klass: string]: any;
    } | null | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<InputGroupAddon, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<InputGroupAddon, "p-inputgroup-addon, p-inputGroupAddon", never, { "style": { "alias": "style"; "required": false; }; "styleClass": { "alias": "styleClass"; "required": false; }; }, {}, never, ["*"], true, never>;
}
declare class InputGroupAddonModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<InputGroupAddonModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<InputGroupAddonModule, never, [typeof InputGroupAddon, typeof i1.SharedModule], [typeof InputGroupAddon, typeof i1.SharedModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<InputGroupAddonModule>;
}

export { InputGroupAddon, InputGroupAddonModule, InputGroupAddonStyle };
