import * as i0 from '@angular/core';
import { OnDestroy, ElementRef, Renderer2, NgZone } from '@angular/core';
import { VoidListener } from 'primeng/ts-helpers';

/**
 * StyleClass manages css classes declaratively to during enter/leave animations or just to toggle classes on an element.
 * @group Components
 */
declare class StyleClass implements OnDestroy {
    el: ElementRef;
    renderer: Renderer2;
    private zone;
    constructor(el: ElementRef, renderer: Renderer2, zone: NgZone);
    /**
     * Selector to define the target element. Available selectors are '@next', '@prev', '@parent' and '@grandparent'.
     * @group Props
     */
    selector: string | undefined;
    /**
     * Style class to add when item begins to get displayed.
     * @group Props
     */
    enterFromClass: string | undefined;
    /**
     * Style class to add during enter animation.
     * @group Props
     */
    enterActiveClass: string | undefined;
    /**
     * Style class to add when item begins to get displayed.
     * @group Props
     */
    enterToClass: string | undefined;
    /**
     * Style class to add when item begins to get hidden.
     * @group Props
     */
    leaveFromClass: string | undefined;
    /**
     * Style class to add during leave animation.
     * @group Props
     */
    leaveActiveClass: string | undefined;
    /**
     * Style class to add when leave animation is completed.
     * @group Props
     */
    leaveToClass: string | undefined;
    /**
     * Whether to trigger leave animation when outside of the element is clicked.
     * @group Props
     */
    hideOnOutsideClick: boolean | undefined;
    /**
     * Adds or removes a class when no enter-leave animation is required.
     * @group Props
     */
    toggleClass: string | undefined;
    /**
     * Whether to trigger leave animation when escape key pressed.
     * @group Props
     */
    hideOnEscape: boolean | undefined;
    /**
     * Whether to trigger leave animation when the target element resized.
     * @group Props
     */
    hideOnResize: boolean | undefined;
    /**
     * Target element to listen resize. Valid values are "window", "document" or target element selector.
     * @group Props
     */
    resizeSelector: string | undefined;
    eventListener: VoidListener;
    documentClickListener: VoidListener;
    documentKeydownListener: VoidListener;
    windowResizeListener: VoidListener;
    resizeObserver: ResizeObserver | undefined;
    target: HTMLElement | null | undefined;
    enterListener: VoidListener;
    leaveListener: VoidListener;
    animating: boolean | undefined;
    _enterClass: string | undefined;
    _leaveClass: string | undefined;
    _resizeTarget: any;
    clickListener(): void;
    toggle(): void;
    enter(): void;
    leave(): void;
    bindDocumentClickListener(): void;
    bindDocumentKeydownListener(): void;
    isVisible(): boolean;
    isOutsideClick(event: MouseEvent): boolean;
    unbindDocumentClickListener(): void;
    unbindDocumentKeydownListener(): void;
    bindResizeListener(): void;
    unbindResizeListener(): void;
    bindWindowResizeListener(): void;
    unbindWindowResizeListener(): void;
    bindElementResizeListener(): void;
    unbindElementResizeListener(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StyleClass, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<StyleClass, "[pStyleClass]", never, { "selector": { "alias": "pStyleClass"; "required": false; }; "enterFromClass": { "alias": "enterFromClass"; "required": false; }; "enterActiveClass": { "alias": "enterActiveClass"; "required": false; }; "enterToClass": { "alias": "enterToClass"; "required": false; }; "leaveFromClass": { "alias": "leaveFromClass"; "required": false; }; "leaveActiveClass": { "alias": "leaveActiveClass"; "required": false; }; "leaveToClass": { "alias": "leaveToClass"; "required": false; }; "hideOnOutsideClick": { "alias": "hideOnOutsideClick"; "required": false; }; "toggleClass": { "alias": "toggleClass"; "required": false; }; "hideOnEscape": { "alias": "hideOnEscape"; "required": false; }; "hideOnResize": { "alias": "hideOnResize"; "required": false; }; "resizeSelector": { "alias": "resizeSelector"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_hideOnOutsideClick: unknown;
    static ngAcceptInputType_hideOnEscape: unknown;
    static ngAcceptInputType_hideOnResize: unknown;
}
declare class StyleClassModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<StyleClassModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<StyleClassModule, never, [typeof StyleClass], [typeof StyleClass]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<StyleClassModule>;
}

export { StyleClass, StyleClassModule };
