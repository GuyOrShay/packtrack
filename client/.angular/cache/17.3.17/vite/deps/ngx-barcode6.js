import {
  require_JsBarcode
} from "./chunk-CK4KZ5OU.js";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  InputFlags,
  Renderer2,
  ViewChild,
  effect,
  inject,
  input,
  setClassMetadata,
  viewChild,
  ɵɵStandaloneFeature,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵqueryAdvance,
  ɵɵviewQuerySignal
} from "./chunk-4RIREABG.js";
import "./chunk-6IRHTY4M.js";
import {
  __spreadProps,
  __spreadValues,
  __toESM
} from "./chunk-TXDUYLVM.js";

// ../node_modules/ngx-barcode6/fesm2022/ngx-barcode6.mjs
var import_jsbarcode = __toESM(require_JsBarcode(), 1);
var _c0 = ["bcElement"];
var NgxBarcode6 = class _NgxBarcode6 {
  elementType = input("svg", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "elementType"
  } : {}), {
    alias: "bc-element-type"
  }));
  cssClass = input("barcode", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "cssClass"
  } : {}), {
    alias: "bc-class"
  }));
  format = input("CODE128", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "format"
  } : {}), {
    alias: "bc-format"
  }));
  lineColor = input("#000000", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "lineColor"
  } : {}), {
    alias: "bc-line-color"
  }));
  width = input(2, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "width"
  } : {}), {
    alias: "bc-width"
  }));
  height = input(100, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "height"
  } : {}), {
    alias: "bc-height"
  }));
  displayValue = input(false, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "displayValue"
  } : {}), {
    alias: "bc-display-value"
  }));
  fontOptions = input("", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "fontOptions"
  } : {}), {
    alias: "bc-font-options"
  }));
  font = input("monospace", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "font"
  } : {}), {
    alias: "bc-font"
  }));
  textAlign = input("center", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "textAlign"
  } : {}), {
    alias: "bc-text-align"
  }));
  textPosition = input("bottom", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "textPosition"
  } : {}), {
    alias: "bc-text-position"
  }));
  textMargin = input(2, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "textMargin"
  } : {}), {
    alias: "bc-text-margin"
  }));
  fontSize = input(20, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "fontSize"
  } : {}), {
    alias: "bc-font-size"
  }));
  background = input("#ffffff", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "background"
  } : {}), {
    alias: "bc-background"
  }));
  margin = input(10, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "margin"
  } : {}), {
    alias: "bc-margin"
  }));
  marginTop = input(10, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "marginTop"
  } : {}), {
    alias: "bc-margin-top"
  }));
  marginBottom = input(10, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "marginBottom"
  } : {}), {
    alias: "bc-margin-bottom"
  }));
  marginLeft = input(10, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "marginLeft"
  } : {}), {
    alias: "bc-margin-left"
  }));
  marginRight = input(10, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "marginRight"
  } : {}), {
    alias: "bc-margin-right"
  }));
  value = input("", __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "value"
  } : {}), {
    alias: "bc-value"
  }));
  valid = input(() => true, __spreadProps(__spreadValues({}, ngDevMode ? {
    debugName: "valid"
  } : {}), {
    alias: "bc-valid"
  }));
  bcElement = viewChild.required("bcElement");
  renderer = inject(Renderer2);
  constructor() {
    effect(() => {
      const barcodeValue = this.value();
      const element = this.bcElement();
      if (element && barcodeValue) {
        this.createBarcode();
      }
    });
  }
  get options() {
    return {
      format: this.format(),
      lineColor: this.lineColor(),
      width: this.width(),
      height: this.height(),
      displayValue: this.displayValue(),
      fontOptions: this.fontOptions(),
      font: this.font(),
      textAlign: this.textAlign(),
      textPosition: this.textPosition(),
      textMargin: this.textMargin(),
      fontSize: this.fontSize(),
      background: this.background(),
      margin: this.margin(),
      marginTop: this.marginTop(),
      marginBottom: this.marginBottom(),
      marginLeft: this.marginLeft(),
      marginRight: this.marginRight(),
      valid: this.valid()
    };
  }
  ngAfterViewInit() {
  }
  createBarcode() {
    const barcodeValue = this.value();
    if (!barcodeValue) {
      return;
    }
    let element;
    switch (this.elementType()) {
      case "img":
        element = this.renderer.createElement("img");
        break;
      case "canvas":
        element = this.renderer.createElement("canvas");
        break;
      case "svg":
      default:
        element = this.renderer.createElement("svg", "svg");
    }
    (0, import_jsbarcode.default)(element, barcodeValue, this.options);
    const bcElementRef = this.bcElement();
    for (const node of bcElementRef.nativeElement.childNodes) {
      this.renderer.removeChild(bcElementRef.nativeElement, node);
    }
    this.renderer.appendChild(bcElementRef.nativeElement, element);
  }
  static ɵfac = function NgxBarcode6_Factory(t) {
    return new (t || _NgxBarcode6)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NgxBarcode6,
    selectors: [["ngx-barcode6"]],
    viewQuery: function NgxBarcode6_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuerySignal(ctx.bcElement, _c0, 5);
      }
      if (rf & 2) {
        ɵɵqueryAdvance();
      }
    },
    inputs: {
      elementType: [InputFlags.SignalBased, "bc-element-type", "elementType"],
      cssClass: [InputFlags.SignalBased, "bc-class", "cssClass"],
      format: [InputFlags.SignalBased, "bc-format", "format"],
      lineColor: [InputFlags.SignalBased, "bc-line-color", "lineColor"],
      width: [InputFlags.SignalBased, "bc-width", "width"],
      height: [InputFlags.SignalBased, "bc-height", "height"],
      displayValue: [InputFlags.SignalBased, "bc-display-value", "displayValue"],
      fontOptions: [InputFlags.SignalBased, "bc-font-options", "fontOptions"],
      font: [InputFlags.SignalBased, "bc-font", "font"],
      textAlign: [InputFlags.SignalBased, "bc-text-align", "textAlign"],
      textPosition: [InputFlags.SignalBased, "bc-text-position", "textPosition"],
      textMargin: [InputFlags.SignalBased, "bc-text-margin", "textMargin"],
      fontSize: [InputFlags.SignalBased, "bc-font-size", "fontSize"],
      background: [InputFlags.SignalBased, "bc-background", "background"],
      margin: [InputFlags.SignalBased, "bc-margin", "margin"],
      marginTop: [InputFlags.SignalBased, "bc-margin-top", "marginTop"],
      marginBottom: [InputFlags.SignalBased, "bc-margin-bottom", "marginBottom"],
      marginLeft: [InputFlags.SignalBased, "bc-margin-left", "marginLeft"],
      marginRight: [InputFlags.SignalBased, "bc-margin-right", "marginRight"],
      value: [InputFlags.SignalBased, "bc-value", "value"],
      valid: [InputFlags.SignalBased, "bc-valid", "valid"]
    },
    standalone: true,
    features: [ɵɵStandaloneFeature],
    decls: 2,
    vars: 2,
    consts: [["bcElement", ""]],
    template: function NgxBarcode6_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelement(0, "div", null, 0);
      }
      if (rf & 2) {
        ɵɵclassMap(ctx.cssClass());
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxBarcode6, [{
    type: Component,
    args: [{
      selector: "ngx-barcode6",
      imports: [],
      template: `<div #bcElement [class]="cssClass()"></div>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], () => [], {
    elementType: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-element-type",
        required: false
      }]
    }],
    cssClass: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-class",
        required: false
      }]
    }],
    format: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-format",
        required: false
      }]
    }],
    lineColor: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-line-color",
        required: false
      }]
    }],
    width: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-width",
        required: false
      }]
    }],
    height: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-height",
        required: false
      }]
    }],
    displayValue: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-display-value",
        required: false
      }]
    }],
    fontOptions: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-font-options",
        required: false
      }]
    }],
    font: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-font",
        required: false
      }]
    }],
    textAlign: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-text-align",
        required: false
      }]
    }],
    textPosition: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-text-position",
        required: false
      }]
    }],
    textMargin: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-text-margin",
        required: false
      }]
    }],
    fontSize: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-font-size",
        required: false
      }]
    }],
    background: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-background",
        required: false
      }]
    }],
    margin: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-margin",
        required: false
      }]
    }],
    marginTop: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-margin-top",
        required: false
      }]
    }],
    marginBottom: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-margin-bottom",
        required: false
      }]
    }],
    marginLeft: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-margin-left",
        required: false
      }]
    }],
    marginRight: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-margin-right",
        required: false
      }]
    }],
    value: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-value",
        required: false
      }]
    }],
    valid: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "bc-valid",
        required: false
      }]
    }],
    bcElement: [{
      type: ViewChild,
      args: ["bcElement", {
        isSignal: true
      }]
    }]
  });
})();
export {
  NgxBarcode6
};
//# sourceMappingURL=ngx-barcode6.js.map
