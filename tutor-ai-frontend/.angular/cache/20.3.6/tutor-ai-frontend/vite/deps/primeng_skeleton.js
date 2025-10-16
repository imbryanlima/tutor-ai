import {
  BaseComponent
} from "./chunk-ORSSJD2F.js";
import {
  BaseStyle
} from "./chunk-AEXRE3OW.js";
import {
  SharedModule
} from "./chunk-CNJKUDFW.js";
import {
  CommonModule
} from "./chunk-Z4J6WMQW.js";
import "./chunk-ZMLREZMJ.js";
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  Input,
  NgModule,
  ViewEncapsulation,
  inject,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵgetInheritedFactory,
  ɵɵstyleMap
} from "./chunk-23FE4IVO.js";
import "./chunk-HWYXSU2G.js";
import "./chunk-JRFR6BLO.js";
import "./chunk-MARUHEWW.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-WDMUDEB6.js";

// node_modules/@primeuix/styles/dist/skeleton/index.mjs
var style = "\n    .p-skeleton {\n        display: block;\n        overflow: hidden;\n        background: dt('skeleton.background');\n        border-radius: dt('skeleton.border.radius');\n    }\n\n    .p-skeleton::after {\n        content: '';\n        animation: p-skeleton-animation 1.2s infinite;\n        height: 100%;\n        left: 0;\n        position: absolute;\n        right: 0;\n        top: 0;\n        transform: translateX(-100%);\n        z-index: 1;\n        background: linear-gradient(90deg, rgba(255, 255, 255, 0), dt('skeleton.animation.background'), rgba(255, 255, 255, 0));\n    }\n\n    [dir='rtl'] .p-skeleton::after {\n        animation-name: p-skeleton-animation-rtl;\n    }\n\n    .p-skeleton-circle {\n        border-radius: 50%;\n    }\n\n    .p-skeleton-animation-none::after {\n        animation: none;\n    }\n\n    @keyframes p-skeleton-animation {\n        from {\n            transform: translateX(-100%);\n        }\n        to {\n            transform: translateX(100%);\n        }\n    }\n\n    @keyframes p-skeleton-animation-rtl {\n        from {\n            transform: translateX(100%);\n        }\n        to {\n            transform: translateX(-100%);\n        }\n    }\n";

// node_modules/primeng/fesm2022/primeng-skeleton.mjs
var inlineStyles = {
  root: {
    position: "relative"
  }
};
var classes = {
  root: ({
    instance
  }) => ["p-skeleton p-component", {
    "p-skeleton-circle": instance.shape === "circle",
    "p-skeleton-animation-none": instance.animation === "none"
  }]
};
var SkeletonStyle = class _SkeletonStyle extends BaseStyle {
  name = "skeleton";
  theme = style;
  classes = classes;
  inlineStyles = inlineStyles;
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵSkeletonStyle_BaseFactory;
    return function SkeletonStyle_Factory(__ngFactoryType__) {
      return (ɵSkeletonStyle_BaseFactory || (ɵSkeletonStyle_BaseFactory = ɵɵgetInheritedFactory(_SkeletonStyle)))(__ngFactoryType__ || _SkeletonStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _SkeletonStyle,
    factory: _SkeletonStyle.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SkeletonStyle, [{
    type: Injectable
  }], null, null);
})();
var SkeletonClasses;
(function(SkeletonClasses2) {
  SkeletonClasses2["root"] = "p-skeleton";
})(SkeletonClasses || (SkeletonClasses = {}));
var Skeleton = class _Skeleton extends BaseComponent {
  /**
   * Class of the element.
   * @deprecated since v20.0.0, use `class` instead.
   * @group Props
   */
  styleClass;
  /**
   * Shape of the element.
   * @group Props
   */
  shape = "rectangle";
  /**
   * Type of the animation.
   * @gruop Props
   */
  animation = "wave";
  /**
   * Border radius of the element, defaults to value from theme.
   * @group Props
   */
  borderRadius;
  /**
   * Size of the skeleton.
   * @group Props
   */
  size;
  /**
   * Width of the element.
   * @group Props
   */
  width = "100%";
  /**
   * Height of the element.
   * @group Props
   */
  height = "1rem";
  _componentStyle = inject(SkeletonStyle);
  get containerStyle() {
    const inlineStyles2 = this._componentStyle?.inlineStyles["root"];
    let style2;
    if (this.size) style2 = __spreadProps(__spreadValues({}, inlineStyles2), {
      width: this.size,
      height: this.size,
      borderRadius: this.borderRadius
    });
    else style2 = __spreadProps(__spreadValues({}, inlineStyles2), {
      width: this.width,
      height: this.height,
      borderRadius: this.borderRadius
    });
    return style2;
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵSkeleton_BaseFactory;
    return function Skeleton_Factory(__ngFactoryType__) {
      return (ɵSkeleton_BaseFactory || (ɵSkeleton_BaseFactory = ɵɵgetInheritedFactory(_Skeleton)))(__ngFactoryType__ || _Skeleton);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _Skeleton,
    selectors: [["p-skeleton"]],
    hostVars: 7,
    hostBindings: function Skeleton_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("aria-hidden", true)("data-pc-name", "skeleton")("data-pc-section", "root");
        ɵɵstyleMap(ctx.containerStyle);
        ɵɵclassMap(ctx.cn(ctx.cx("root"), ctx.styleClass));
      }
    },
    inputs: {
      styleClass: "styleClass",
      shape: "shape",
      animation: "animation",
      borderRadius: "borderRadius",
      size: "size",
      width: "width",
      height: "height"
    },
    features: [ɵɵProvidersFeature([SkeletonStyle]), ɵɵInheritDefinitionFeature],
    decls: 0,
    vars: 0,
    template: function Skeleton_Template(rf, ctx) {
    },
    dependencies: [CommonModule, SharedModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Skeleton, [{
    type: Component,
    args: [{
      selector: "p-skeleton",
      standalone: true,
      imports: [CommonModule, SharedModule],
      template: ``,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [SkeletonStyle],
      host: {
        "[attr.aria-hidden]": "true",
        "[attr.data-pc-name]": "'skeleton'",
        "[attr.data-pc-section]": "'root'",
        "[class]": "cn(cx('root'), styleClass)",
        "[style]": "containerStyle"
      }
    }]
  }], null, {
    styleClass: [{
      type: Input
    }],
    shape: [{
      type: Input
    }],
    animation: [{
      type: Input
    }],
    borderRadius: [{
      type: Input
    }],
    size: [{
      type: Input
    }],
    width: [{
      type: Input
    }],
    height: [{
      type: Input
    }]
  });
})();
var SkeletonModule = class _SkeletonModule {
  static ɵfac = function SkeletonModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SkeletonModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _SkeletonModule,
    imports: [Skeleton, SharedModule],
    exports: [Skeleton, SharedModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [Skeleton, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SkeletonModule, [{
    type: NgModule,
    args: [{
      imports: [Skeleton, SharedModule],
      exports: [Skeleton, SharedModule]
    }]
  }], null, null);
})();
export {
  Skeleton,
  SkeletonClasses,
  SkeletonModule,
  SkeletonStyle
};
//# sourceMappingURL=primeng_skeleton.js.map
