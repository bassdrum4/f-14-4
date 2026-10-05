var qx=Object.defineProperty;var Kx=(i,e,t)=>e in i?qx(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var ge=(i,e,t)=>Kx(i,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=t(o);fetch(o.href,a)}})();var Eh={exports:{}},_a={},Th={exports:{}},yt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var og;function $x(){if(og)return yt;og=1;var i=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),a=Symbol.for("react.provider"),c=Symbol.for("react.context"),u=Symbol.for("react.forward_ref"),f=Symbol.for("react.suspense"),d=Symbol.for("react.memo"),m=Symbol.for("react.lazy"),g=Symbol.iterator;function v(k){return k===null||typeof k!="object"?null:(k=g&&k[g]||k["@@iterator"],typeof k=="function"?k:null)}var S={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,w={};function y(k,ee,Fe){this.props=k,this.context=ee,this.refs=w,this.updater=Fe||S}y.prototype.isReactComponent={},y.prototype.setState=function(k,ee){if(typeof k!="object"&&typeof k!="function"&&k!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,k,ee,"setState")},y.prototype.forceUpdate=function(k){this.updater.enqueueForceUpdate(this,k,"forceUpdate")};function _(){}_.prototype=y.prototype;function L(k,ee,Fe){this.props=k,this.context=ee,this.refs=w,this.updater=Fe||S}var P=L.prototype=new _;P.constructor=L,M(P,y.prototype),P.isPureReactComponent=!0;var T=Array.isArray,V=Object.prototype.hasOwnProperty,I={current:null},N={key:!0,ref:!0,__self:!0,__source:!0};function z(k,ee,Fe){var J,fe={},we=null,ve=null;if(ee!=null)for(J in ee.ref!==void 0&&(ve=ee.ref),ee.key!==void 0&&(we=""+ee.key),ee)V.call(ee,J)&&!N.hasOwnProperty(J)&&(fe[J]=ee[J]);var Ae=arguments.length-2;if(Ae===1)fe.children=Fe;else if(1<Ae){for(var Be=Array(Ae),Ze=0;Ze<Ae;Ze++)Be[Ze]=arguments[Ze+2];fe.children=Be}if(k&&k.defaultProps)for(J in Ae=k.defaultProps,Ae)fe[J]===void 0&&(fe[J]=Ae[J]);return{$$typeof:i,type:k,key:we,ref:ve,props:fe,_owner:I.current}}function R(k,ee){return{$$typeof:i,type:k.type,key:ee,ref:k.ref,props:k.props,_owner:k._owner}}function A(k){return typeof k=="object"&&k!==null&&k.$$typeof===i}function F(k){var ee={"=":"=0",":":"=2"};return"$"+k.replace(/[=:]/g,function(Fe){return ee[Fe]})}var $=/\/+/g;function Y(k,ee){return typeof k=="object"&&k!==null&&k.key!=null?F(""+k.key):ee.toString(36)}function ie(k,ee,Fe,J,fe){var we=typeof k;(we==="undefined"||we==="boolean")&&(k=null);var ve=!1;if(k===null)ve=!0;else switch(we){case"string":case"number":ve=!0;break;case"object":switch(k.$$typeof){case i:case e:ve=!0}}if(ve)return ve=k,fe=fe(ve),k=J===""?"."+Y(ve,0):J,T(fe)?(Fe="",k!=null&&(Fe=k.replace($,"$&/")+"/"),ie(fe,ee,Fe,"",function(Ze){return Ze})):fe!=null&&(A(fe)&&(fe=R(fe,Fe+(!fe.key||ve&&ve.key===fe.key?"":(""+fe.key).replace($,"$&/")+"/")+k)),ee.push(fe)),1;if(ve=0,J=J===""?".":J+":",T(k))for(var Ae=0;Ae<k.length;Ae++){we=k[Ae];var Be=J+Y(we,Ae);ve+=ie(we,ee,Fe,Be,fe)}else if(Be=v(k),typeof Be=="function")for(k=Be.call(k),Ae=0;!(we=k.next()).done;)we=we.value,Be=J+Y(we,Ae++),ve+=ie(we,ee,Fe,Be,fe);else if(we==="object")throw ee=String(k),Error("Objects are not valid as a React child (found: "+(ee==="[object Object]"?"object with keys {"+Object.keys(k).join(", ")+"}":ee)+"). If you meant to render a collection of children, use an array instead.");return ve}function ce(k,ee,Fe){if(k==null)return k;var J=[],fe=0;return ie(k,J,"","",function(we){return ee.call(Fe,we,fe++)}),J}function oe(k){if(k._status===-1){var ee=k._result;ee=ee(),ee.then(function(Fe){(k._status===0||k._status===-1)&&(k._status=1,k._result=Fe)},function(Fe){(k._status===0||k._status===-1)&&(k._status=2,k._result=Fe)}),k._status===-1&&(k._status=0,k._result=ee)}if(k._status===1)return k._result.default;throw k._result}var ue={current:null},G={transition:null},he={ReactCurrentDispatcher:ue,ReactCurrentBatchConfig:G,ReactCurrentOwner:I};function ae(){throw Error("act(...) is not supported in production builds of React.")}return yt.Children={map:ce,forEach:function(k,ee,Fe){ce(k,function(){ee.apply(this,arguments)},Fe)},count:function(k){var ee=0;return ce(k,function(){ee++}),ee},toArray:function(k){return ce(k,function(ee){return ee})||[]},only:function(k){if(!A(k))throw Error("React.Children.only expected to receive a single React element child.");return k}},yt.Component=y,yt.Fragment=t,yt.Profiler=o,yt.PureComponent=L,yt.StrictMode=r,yt.Suspense=f,yt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=he,yt.act=ae,yt.cloneElement=function(k,ee,Fe){if(k==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+k+".");var J=M({},k.props),fe=k.key,we=k.ref,ve=k._owner;if(ee!=null){if(ee.ref!==void 0&&(we=ee.ref,ve=I.current),ee.key!==void 0&&(fe=""+ee.key),k.type&&k.type.defaultProps)var Ae=k.type.defaultProps;for(Be in ee)V.call(ee,Be)&&!N.hasOwnProperty(Be)&&(J[Be]=ee[Be]===void 0&&Ae!==void 0?Ae[Be]:ee[Be])}var Be=arguments.length-2;if(Be===1)J.children=Fe;else if(1<Be){Ae=Array(Be);for(var Ze=0;Ze<Be;Ze++)Ae[Ze]=arguments[Ze+2];J.children=Ae}return{$$typeof:i,type:k.type,key:fe,ref:we,props:J,_owner:ve}},yt.createContext=function(k){return k={$$typeof:c,_currentValue:k,_currentValue2:k,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},k.Provider={$$typeof:a,_context:k},k.Consumer=k},yt.createElement=z,yt.createFactory=function(k){var ee=z.bind(null,k);return ee.type=k,ee},yt.createRef=function(){return{current:null}},yt.forwardRef=function(k){return{$$typeof:u,render:k}},yt.isValidElement=A,yt.lazy=function(k){return{$$typeof:m,_payload:{_status:-1,_result:k},_init:oe}},yt.memo=function(k,ee){return{$$typeof:d,type:k,compare:ee===void 0?null:ee}},yt.startTransition=function(k){var ee=G.transition;G.transition={};try{k()}finally{G.transition=ee}},yt.unstable_act=ae,yt.useCallback=function(k,ee){return ue.current.useCallback(k,ee)},yt.useContext=function(k){return ue.current.useContext(k)},yt.useDebugValue=function(){},yt.useDeferredValue=function(k){return ue.current.useDeferredValue(k)},yt.useEffect=function(k,ee){return ue.current.useEffect(k,ee)},yt.useId=function(){return ue.current.useId()},yt.useImperativeHandle=function(k,ee,Fe){return ue.current.useImperativeHandle(k,ee,Fe)},yt.useInsertionEffect=function(k,ee){return ue.current.useInsertionEffect(k,ee)},yt.useLayoutEffect=function(k,ee){return ue.current.useLayoutEffect(k,ee)},yt.useMemo=function(k,ee){return ue.current.useMemo(k,ee)},yt.useReducer=function(k,ee,Fe){return ue.current.useReducer(k,ee,Fe)},yt.useRef=function(k){return ue.current.useRef(k)},yt.useState=function(k){return ue.current.useState(k)},yt.useSyncExternalStore=function(k,ee,Fe){return ue.current.useSyncExternalStore(k,ee,Fe)},yt.useTransition=function(){return ue.current.useTransition()},yt.version="18.3.1",yt}var ag;function _d(){return ag||(ag=1,Th.exports=$x()),Th.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var lg;function Zx(){if(lg)return _a;lg=1;var i=_d(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,o=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function c(u,f,d){var m,g={},v=null,S=null;d!==void 0&&(v=""+d),f.key!==void 0&&(v=""+f.key),f.ref!==void 0&&(S=f.ref);for(m in f)r.call(f,m)&&!a.hasOwnProperty(m)&&(g[m]=f[m]);if(u&&u.defaultProps)for(m in f=u.defaultProps,f)g[m]===void 0&&(g[m]=f[m]);return{$$typeof:e,type:u,key:v,ref:S,props:g,_owner:o.current}}return _a.Fragment=t,_a.jsx=c,_a.jsxs=c,_a}var cg;function Qx(){return cg||(cg=1,Eh.exports=Zx()),Eh.exports}var se=Qx(),_n=_d(),Zl={},Ah={exports:{}},Yn={},Ch={exports:{}},Rh={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ug;function Jx(){return ug||(ug=1,(function(i){function e(G,he){var ae=G.length;G.push(he);e:for(;0<ae;){var k=ae-1>>>1,ee=G[k];if(0<o(ee,he))G[k]=he,G[ae]=ee,ae=k;else break e}}function t(G){return G.length===0?null:G[0]}function r(G){if(G.length===0)return null;var he=G[0],ae=G.pop();if(ae!==he){G[0]=ae;e:for(var k=0,ee=G.length,Fe=ee>>>1;k<Fe;){var J=2*(k+1)-1,fe=G[J],we=J+1,ve=G[we];if(0>o(fe,ae))we<ee&&0>o(ve,fe)?(G[k]=ve,G[we]=ae,k=we):(G[k]=fe,G[J]=ae,k=J);else if(we<ee&&0>o(ve,ae))G[k]=ve,G[we]=ae,k=we;else break e}}return he}function o(G,he){var ae=G.sortIndex-he.sortIndex;return ae!==0?ae:G.id-he.id}if(typeof performance=="object"&&typeof performance.now=="function"){var a=performance;i.unstable_now=function(){return a.now()}}else{var c=Date,u=c.now();i.unstable_now=function(){return c.now()-u}}var f=[],d=[],m=1,g=null,v=3,S=!1,M=!1,w=!1,y=typeof setTimeout=="function"?setTimeout:null,_=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function P(G){for(var he=t(d);he!==null;){if(he.callback===null)r(d);else if(he.startTime<=G)r(d),he.sortIndex=he.expirationTime,e(f,he);else break;he=t(d)}}function T(G){if(w=!1,P(G),!M)if(t(f)!==null)M=!0,oe(V);else{var he=t(d);he!==null&&ue(T,he.startTime-G)}}function V(G,he){M=!1,w&&(w=!1,_(z),z=-1),S=!0;var ae=v;try{for(P(he),g=t(f);g!==null&&(!(g.expirationTime>he)||G&&!F());){var k=g.callback;if(typeof k=="function"){g.callback=null,v=g.priorityLevel;var ee=k(g.expirationTime<=he);he=i.unstable_now(),typeof ee=="function"?g.callback=ee:g===t(f)&&r(f),P(he)}else r(f);g=t(f)}if(g!==null)var Fe=!0;else{var J=t(d);J!==null&&ue(T,J.startTime-he),Fe=!1}return Fe}finally{g=null,v=ae,S=!1}}var I=!1,N=null,z=-1,R=5,A=-1;function F(){return!(i.unstable_now()-A<R)}function $(){if(N!==null){var G=i.unstable_now();A=G;var he=!0;try{he=N(!0,G)}finally{he?Y():(I=!1,N=null)}}else I=!1}var Y;if(typeof L=="function")Y=function(){L($)};else if(typeof MessageChannel<"u"){var ie=new MessageChannel,ce=ie.port2;ie.port1.onmessage=$,Y=function(){ce.postMessage(null)}}else Y=function(){y($,0)};function oe(G){N=G,I||(I=!0,Y())}function ue(G,he){z=y(function(){G(i.unstable_now())},he)}i.unstable_IdlePriority=5,i.unstable_ImmediatePriority=1,i.unstable_LowPriority=4,i.unstable_NormalPriority=3,i.unstable_Profiling=null,i.unstable_UserBlockingPriority=2,i.unstable_cancelCallback=function(G){G.callback=null},i.unstable_continueExecution=function(){M||S||(M=!0,oe(V))},i.unstable_forceFrameRate=function(G){0>G||125<G?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):R=0<G?Math.floor(1e3/G):5},i.unstable_getCurrentPriorityLevel=function(){return v},i.unstable_getFirstCallbackNode=function(){return t(f)},i.unstable_next=function(G){switch(v){case 1:case 2:case 3:var he=3;break;default:he=v}var ae=v;v=he;try{return G()}finally{v=ae}},i.unstable_pauseExecution=function(){},i.unstable_requestPaint=function(){},i.unstable_runWithPriority=function(G,he){switch(G){case 1:case 2:case 3:case 4:case 5:break;default:G=3}var ae=v;v=G;try{return he()}finally{v=ae}},i.unstable_scheduleCallback=function(G,he,ae){var k=i.unstable_now();switch(typeof ae=="object"&&ae!==null?(ae=ae.delay,ae=typeof ae=="number"&&0<ae?k+ae:k):ae=k,G){case 1:var ee=-1;break;case 2:ee=250;break;case 5:ee=1073741823;break;case 4:ee=1e4;break;default:ee=5e3}return ee=ae+ee,G={id:m++,callback:he,priorityLevel:G,startTime:ae,expirationTime:ee,sortIndex:-1},ae>k?(G.sortIndex=ae,e(d,G),t(f)===null&&G===t(d)&&(w?(_(z),z=-1):w=!0,ue(T,ae-k))):(G.sortIndex=ee,e(f,G),M||S||(M=!0,oe(V))),G},i.unstable_shouldYield=F,i.unstable_wrapCallback=function(G){var he=v;return function(){var ae=v;v=he;try{return G.apply(this,arguments)}finally{v=ae}}}})(Rh)),Rh}var hg;function ey(){return hg||(hg=1,Ch.exports=Jx()),Ch.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var fg;function ty(){if(fg)return Yn;fg=1;var i=_d(),e=ey();function t(n){for(var s="https://reactjs.org/docs/error-decoder.html?invariant="+n,l=1;l<arguments.length;l++)s+="&args[]="+encodeURIComponent(arguments[l]);return"Minified React error #"+n+"; visit "+s+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,o={};function a(n,s){c(n,s),c(n+"Capture",s)}function c(n,s){for(o[n]=s,n=0;n<s.length;n++)r.add(s[n])}var u=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),f=Object.prototype.hasOwnProperty,d=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,m={},g={};function v(n){return f.call(g,n)?!0:f.call(m,n)?!1:d.test(n)?g[n]=!0:(m[n]=!0,!1)}function S(n,s,l,h){if(l!==null&&l.type===0)return!1;switch(typeof s){case"function":case"symbol":return!0;case"boolean":return h?!1:l!==null?!l.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function M(n,s,l,h){if(s===null||typeof s>"u"||S(n,s,l,h))return!0;if(h)return!1;if(l!==null)switch(l.type){case 3:return!s;case 4:return s===!1;case 5:return isNaN(s);case 6:return isNaN(s)||1>s}return!1}function w(n,s,l,h,p,x,E){this.acceptsBooleans=s===2||s===3||s===4,this.attributeName=h,this.attributeNamespace=p,this.mustUseProperty=l,this.propertyName=n,this.type=s,this.sanitizeURL=x,this.removeEmptyString=E}var y={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){y[n]=new w(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var s=n[0];y[s]=new w(s,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){y[n]=new w(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){y[n]=new w(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){y[n]=new w(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){y[n]=new w(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){y[n]=new w(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){y[n]=new w(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){y[n]=new w(n,5,!1,n.toLowerCase(),null,!1,!1)});var _=/[\-:]([a-z])/g;function L(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var s=n.replace(_,L);y[s]=new w(s,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var s=n.replace(_,L);y[s]=new w(s,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var s=n.replace(_,L);y[s]=new w(s,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){y[n]=new w(n,1,!1,n.toLowerCase(),null,!1,!1)}),y.xlinkHref=new w("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){y[n]=new w(n,1,!1,n.toLowerCase(),null,!0,!0)});function P(n,s,l,h){var p=y.hasOwnProperty(s)?y[s]:null;(p!==null?p.type!==0:h||!(2<s.length)||s[0]!=="o"&&s[0]!=="O"||s[1]!=="n"&&s[1]!=="N")&&(M(s,l,p,h)&&(l=null),h||p===null?v(s)&&(l===null?n.removeAttribute(s):n.setAttribute(s,""+l)):p.mustUseProperty?n[p.propertyName]=l===null?p.type===3?!1:"":l:(s=p.attributeName,h=p.attributeNamespace,l===null?n.removeAttribute(s):(p=p.type,l=p===3||p===4&&l===!0?"":""+l,h?n.setAttributeNS(h,s,l):n.setAttribute(s,l))))}var T=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,V=Symbol.for("react.element"),I=Symbol.for("react.portal"),N=Symbol.for("react.fragment"),z=Symbol.for("react.strict_mode"),R=Symbol.for("react.profiler"),A=Symbol.for("react.provider"),F=Symbol.for("react.context"),$=Symbol.for("react.forward_ref"),Y=Symbol.for("react.suspense"),ie=Symbol.for("react.suspense_list"),ce=Symbol.for("react.memo"),oe=Symbol.for("react.lazy"),ue=Symbol.for("react.offscreen"),G=Symbol.iterator;function he(n){return n===null||typeof n!="object"?null:(n=G&&n[G]||n["@@iterator"],typeof n=="function"?n:null)}var ae=Object.assign,k;function ee(n){if(k===void 0)try{throw Error()}catch(l){var s=l.stack.trim().match(/\n( *(at )?)/);k=s&&s[1]||""}return`
`+k+n}var Fe=!1;function J(n,s){if(!n||Fe)return"";Fe=!0;var l=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(s)if(s=function(){throw Error()},Object.defineProperty(s.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(s,[])}catch(te){var h=te}Reflect.construct(n,[],s)}else{try{s.call()}catch(te){h=te}n.call(s.prototype)}else{try{throw Error()}catch(te){h=te}n()}}catch(te){if(te&&h&&typeof te.stack=="string"){for(var p=te.stack.split(`
`),x=h.stack.split(`
`),E=p.length-1,U=x.length-1;1<=E&&0<=U&&p[E]!==x[U];)U--;for(;1<=E&&0<=U;E--,U--)if(p[E]!==x[U]){if(E!==1||U!==1)do if(E--,U--,0>U||p[E]!==x[U]){var H=`
`+p[E].replace(" at new "," at ");return n.displayName&&H.includes("<anonymous>")&&(H=H.replace("<anonymous>",n.displayName)),H}while(1<=E&&0<=U);break}}}finally{Fe=!1,Error.prepareStackTrace=l}return(n=n?n.displayName||n.name:"")?ee(n):""}function fe(n){switch(n.tag){case 5:return ee(n.type);case 16:return ee("Lazy");case 13:return ee("Suspense");case 19:return ee("SuspenseList");case 0:case 2:case 15:return n=J(n.type,!1),n;case 11:return n=J(n.type.render,!1),n;case 1:return n=J(n.type,!0),n;default:return""}}function we(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case N:return"Fragment";case I:return"Portal";case R:return"Profiler";case z:return"StrictMode";case Y:return"Suspense";case ie:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case F:return(n.displayName||"Context")+".Consumer";case A:return(n._context.displayName||"Context")+".Provider";case $:var s=n.render;return n=n.displayName,n||(n=s.displayName||s.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case ce:return s=n.displayName||null,s!==null?s:we(n.type)||"Memo";case oe:s=n._payload,n=n._init;try{return we(n(s))}catch{}}return null}function ve(n){var s=n.type;switch(n.tag){case 24:return"Cache";case 9:return(s.displayName||"Context")+".Consumer";case 10:return(s._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=s.render,n=n.displayName||n.name||"",s.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return s;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return we(s);case 8:return s===z?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof s=="function")return s.displayName||s.name||null;if(typeof s=="string")return s}return null}function Ae(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Be(n){var s=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(s==="checkbox"||s==="radio")}function Ze(n){var s=Be(n)?"checked":"value",l=Object.getOwnPropertyDescriptor(n.constructor.prototype,s),h=""+n[s];if(!n.hasOwnProperty(s)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var p=l.get,x=l.set;return Object.defineProperty(n,s,{configurable:!0,get:function(){return p.call(this)},set:function(E){h=""+E,x.call(this,E)}}),Object.defineProperty(n,s,{enumerable:l.enumerable}),{getValue:function(){return h},setValue:function(E){h=""+E},stopTracking:function(){n._valueTracker=null,delete n[s]}}}}function _t(n){n._valueTracker||(n._valueTracker=Ze(n))}function _e(n){if(!n)return!1;var s=n._valueTracker;if(!s)return!0;var l=s.getValue(),h="";return n&&(h=Be(n)?n.checked?"true":"false":n.value),n=h,n!==l?(s.setValue(n),!0):!1}function Re(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function O(n,s){var l=s.checked;return ae({},s,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:l??n._wrapperState.initialChecked})}function Qe(n,s){var l=s.defaultValue==null?"":s.defaultValue,h=s.checked!=null?s.checked:s.defaultChecked;l=Ae(s.value!=null?s.value:l),n._wrapperState={initialChecked:h,initialValue:l,controlled:s.type==="checkbox"||s.type==="radio"?s.checked!=null:s.value!=null}}function Ee(n,s){s=s.checked,s!=null&&P(n,"checked",s,!1)}function Ve(n,s){Ee(n,s);var l=Ae(s.value),h=s.type;if(l!=null)h==="number"?(l===0&&n.value===""||n.value!=l)&&(n.value=""+l):n.value!==""+l&&(n.value=""+l);else if(h==="submit"||h==="reset"){n.removeAttribute("value");return}s.hasOwnProperty("value")?it(n,s.type,l):s.hasOwnProperty("defaultValue")&&it(n,s.type,Ae(s.defaultValue)),s.checked==null&&s.defaultChecked!=null&&(n.defaultChecked=!!s.defaultChecked)}function Le(n,s,l){if(s.hasOwnProperty("value")||s.hasOwnProperty("defaultValue")){var h=s.type;if(!(h!=="submit"&&h!=="reset"||s.value!==void 0&&s.value!==null))return;s=""+n._wrapperState.initialValue,l||s===n.value||(n.value=s),n.defaultValue=s}l=n.name,l!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,l!==""&&(n.name=l)}function it(n,s,l){(s!=="number"||Re(n.ownerDocument)!==n)&&(l==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+l&&(n.defaultValue=""+l))}var Oe=Array.isArray;function D(n,s,l,h){if(n=n.options,s){s={};for(var p=0;p<l.length;p++)s["$"+l[p]]=!0;for(l=0;l<n.length;l++)p=s.hasOwnProperty("$"+n[l].value),n[l].selected!==p&&(n[l].selected=p),p&&h&&(n[l].defaultSelected=!0)}else{for(l=""+Ae(l),s=null,p=0;p<n.length;p++){if(n[p].value===l){n[p].selected=!0,h&&(n[p].defaultSelected=!0);return}s!==null||n[p].disabled||(s=n[p])}s!==null&&(s.selected=!0)}}function C(n,s){if(s.dangerouslySetInnerHTML!=null)throw Error(t(91));return ae({},s,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function Z(n,s){var l=s.value;if(l==null){if(l=s.children,s=s.defaultValue,l!=null){if(s!=null)throw Error(t(92));if(Oe(l)){if(1<l.length)throw Error(t(93));l=l[0]}s=l}s==null&&(s=""),l=s}n._wrapperState={initialValue:Ae(l)}}function de(n,s){var l=Ae(s.value),h=Ae(s.defaultValue);l!=null&&(l=""+l,l!==n.value&&(n.value=l),s.defaultValue==null&&n.defaultValue!==l&&(n.defaultValue=l)),h!=null&&(n.defaultValue=""+h)}function xe(n){var s=n.textContent;s===n._wrapperState.initialValue&&s!==""&&s!==null&&(n.value=s)}function pe(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function qe(n,s){return n==null||n==="http://www.w3.org/1999/xhtml"?pe(s):n==="http://www.w3.org/2000/svg"&&s==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var De,Ge=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(s,l,h,p){MSApp.execUnsafeLocalFunction(function(){return n(s,l,h,p)})}:n})(function(n,s){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=s;else{for(De=De||document.createElement("div"),De.innerHTML="<svg>"+s.valueOf().toString()+"</svg>",s=De.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;s.firstChild;)n.appendChild(s.firstChild)}});function pt(n,s){if(s){var l=n.firstChild;if(l&&l===n.lastChild&&l.nodeType===3){l.nodeValue=s;return}}n.textContent=s}var Te={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Xe=["Webkit","ms","Moz","O"];Object.keys(Te).forEach(function(n){Xe.forEach(function(s){s=s+n.charAt(0).toUpperCase()+n.substring(1),Te[s]=Te[n]})});function ot(n,s,l){return s==null||typeof s=="boolean"||s===""?"":l||typeof s!="number"||s===0||Te.hasOwnProperty(n)&&Te[n]?(""+s).trim():s+"px"}function at(n,s){n=n.style;for(var l in s)if(s.hasOwnProperty(l)){var h=l.indexOf("--")===0,p=ot(l,s[l],h);l==="float"&&(l="cssFloat"),h?n.setProperty(l,p):n[l]=p}}var je=ae({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function xt(n,s){if(s){if(je[n]&&(s.children!=null||s.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(s.dangerouslySetInnerHTML!=null){if(s.children!=null)throw Error(t(60));if(typeof s.dangerouslySetInnerHTML!="object"||!("__html"in s.dangerouslySetInnerHTML))throw Error(t(61))}if(s.style!=null&&typeof s.style!="object")throw Error(t(62))}}function ft(n,s){if(n.indexOf("-")===-1)return typeof s.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Lt=null;function X(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Ie=null,le=null,me=null;function ke(n){if(n=ia(n)){if(typeof Ie!="function")throw Error(t(280));var s=n.stateNode;s&&(s=fl(s),Ie(n.stateNode,n.type,s))}}function Ue(n){le?me?me.push(n):me=[n]:le=n}function dt(){if(le){var n=le,s=me;if(me=le=null,ke(n),s)for(n=0;n<s.length;n++)ke(s[n])}}function Ot(n,s){return n(s)}function Jt(){}var wt=!1;function Bn(n,s,l){if(wt)return n(s,l);wt=!0;try{return Ot(n,s,l)}finally{wt=!1,(le!==null||me!==null)&&(Jt(),dt())}}function bn(n,s){var l=n.stateNode;if(l===null)return null;var h=fl(l);if(h===null)return null;l=h[s];e:switch(s){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(h=!h.disabled)||(n=n.type,h=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!h;break e;default:n=!1}if(n)return null;if(l&&typeof l!="function")throw Error(t(231,s,typeof l));return l}var Ps=!1;if(u)try{var _r={};Object.defineProperty(_r,"passive",{get:function(){Ps=!0}}),window.addEventListener("test",_r,_r),window.removeEventListener("test",_r,_r)}catch{Ps=!1}function qi(n,s,l,h,p,x,E,U,H){var te=Array.prototype.slice.call(arguments,3);try{s.apply(l,te)}catch(Se){this.onError(Se)}}var Ki=!1,Zr=null,Qr=!1,xr=null,ja={onError:function(n){Ki=!0,Zr=n}};function bs(n,s,l,h,p,x,E,U,H){Ki=!1,Zr=null,qi.apply(ja,arguments)}function Ya(n,s,l,h,p,x,E,U,H){if(bs.apply(this,arguments),Ki){if(Ki){var te=Zr;Ki=!1,Zr=null}else throw Error(t(198));Qr||(Qr=!0,xr=te)}}function Ii(n){var s=n,l=n;if(n.alternate)for(;s.return;)s=s.return;else{n=s;do s=n,(s.flags&4098)!==0&&(l=s.return),n=s.return;while(n)}return s.tag===3?l:null}function qa(n){if(n.tag===13){var s=n.memoizedState;if(s===null&&(n=n.alternate,n!==null&&(s=n.memoizedState)),s!==null)return s.dehydrated}return null}function Ka(n){if(Ii(n)!==n)throw Error(t(188))}function jc(n){var s=n.alternate;if(!s){if(s=Ii(n),s===null)throw Error(t(188));return s!==n?null:n}for(var l=n,h=s;;){var p=l.return;if(p===null)break;var x=p.alternate;if(x===null){if(h=p.return,h!==null){l=h;continue}break}if(p.child===x.child){for(x=p.child;x;){if(x===l)return Ka(p),n;if(x===h)return Ka(p),s;x=x.sibling}throw Error(t(188))}if(l.return!==h.return)l=p,h=x;else{for(var E=!1,U=p.child;U;){if(U===l){E=!0,l=p,h=x;break}if(U===h){E=!0,h=p,l=x;break}U=U.sibling}if(!E){for(U=x.child;U;){if(U===l){E=!0,l=x,h=p;break}if(U===h){E=!0,h=x,l=p;break}U=U.sibling}if(!E)throw Error(t(189))}}if(l.alternate!==h)throw Error(t(190))}if(l.tag!==3)throw Error(t(188));return l.stateNode.current===l?n:s}function b(n){return n=jc(n),n!==null?j(n):null}function j(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var s=j(n);if(s!==null)return s;n=n.sibling}return null}var ne=e.unstable_scheduleCallback,re=e.unstable_cancelCallback,q=e.unstable_shouldYield,be=e.unstable_requestPaint,Ce=e.unstable_now,Je=e.unstable_getCurrentPriorityLevel,Ke=e.unstable_ImmediatePriority,lt=e.unstable_UserBlockingPriority,ut=e.unstable_NormalPriority,et=e.unstable_LowPriority,Mt=e.unstable_IdlePriority,bt=null,St=null;function xn(n){if(St&&typeof St.onCommitFiberRoot=="function")try{St.onCommitFiberRoot(bt,n,void 0,(n.current.flags&128)===128)}catch{}}var mt=Math.clz32?Math.clz32:Ct,nt=Math.log,xi=Math.LN2;function Ct(n){return n>>>=0,n===0?32:31-(nt(n)/xi|0)|0}var yn=64,yi=4194304;function en(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ni(n,s){var l=n.pendingLanes;if(l===0)return 0;var h=0,p=n.suspendedLanes,x=n.pingedLanes,E=l&268435455;if(E!==0){var U=E&~p;U!==0?h=en(U):(x&=E,x!==0&&(h=en(x)))}else E=l&~p,E!==0?h=en(E):x!==0&&(h=en(x));if(h===0)return 0;if(s!==0&&s!==h&&(s&p)===0&&(p=h&-h,x=s&-s,p>=x||p===16&&(x&4194240)!==0))return s;if((h&4)!==0&&(h|=l&16),s=n.entangledLanes,s!==0)for(n=n.entanglements,s&=h;0<s;)l=31-mt(s),p=1<<l,h|=n[l],s&=~p;return h}function Ut(n,s){switch(n){case 1:case 2:case 4:return s+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return s+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function si(n,s){for(var l=n.suspendedLanes,h=n.pingedLanes,p=n.expirationTimes,x=n.pendingLanes;0<x;){var E=31-mt(x),U=1<<E,H=p[E];H===-1?((U&l)===0||(U&h)!==0)&&(p[E]=Ut(U,s)):H<=s&&(n.expiredLanes|=U),x&=~U}}function $i(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function Ln(){var n=yn;return yn<<=1,(yn&4194240)===0&&(yn=64),n}function oi(n){for(var s=[],l=0;31>l;l++)s.push(n);return s}function Hn(n,s,l){n.pendingLanes|=s,s!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,s=31-mt(s),n[s]=l}function $a(n,s){var l=n.pendingLanes&~s;n.pendingLanes=s,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=s,n.mutableReadLanes&=s,n.entangledLanes&=s,s=n.entanglements;var h=n.eventTimes;for(n=n.expirationTimes;0<l;){var p=31-mt(l),x=1<<p;s[p]=0,h[p]=-1,n[p]=-1,l&=~x}}function Yc(n,s){var l=n.entangledLanes|=s;for(n=n.entanglements;l;){var h=31-mt(l),p=1<<h;p&s|n[h]&s&&(n[h]|=s),l&=~p}}var Dt=0;function kd(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var zd,qc,Bd,Hd,Vd,Kc=!1,Za=[],yr=null,Sr=null,Mr=null,Ho=new Map,Vo=new Map,wr=[],g_="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Gd(n,s){switch(n){case"focusin":case"focusout":yr=null;break;case"dragenter":case"dragleave":Sr=null;break;case"mouseover":case"mouseout":Mr=null;break;case"pointerover":case"pointerout":Ho.delete(s.pointerId);break;case"gotpointercapture":case"lostpointercapture":Vo.delete(s.pointerId)}}function Go(n,s,l,h,p,x){return n===null||n.nativeEvent!==x?(n={blockedOn:s,domEventName:l,eventSystemFlags:h,nativeEvent:x,targetContainers:[p]},s!==null&&(s=ia(s),s!==null&&qc(s)),n):(n.eventSystemFlags|=h,s=n.targetContainers,p!==null&&s.indexOf(p)===-1&&s.push(p),n)}function v_(n,s,l,h,p){switch(s){case"focusin":return yr=Go(yr,n,s,l,h,p),!0;case"dragenter":return Sr=Go(Sr,n,s,l,h,p),!0;case"mouseover":return Mr=Go(Mr,n,s,l,h,p),!0;case"pointerover":var x=p.pointerId;return Ho.set(x,Go(Ho.get(x)||null,n,s,l,h,p)),!0;case"gotpointercapture":return x=p.pointerId,Vo.set(x,Go(Vo.get(x)||null,n,s,l,h,p)),!0}return!1}function Wd(n){var s=Jr(n.target);if(s!==null){var l=Ii(s);if(l!==null){if(s=l.tag,s===13){if(s=qa(l),s!==null){n.blockedOn=s,Vd(n.priority,function(){Bd(l)});return}}else if(s===3&&l.stateNode.current.memoizedState.isDehydrated){n.blockedOn=l.tag===3?l.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Qa(n){if(n.blockedOn!==null)return!1;for(var s=n.targetContainers;0<s.length;){var l=Zc(n.domEventName,n.eventSystemFlags,s[0],n.nativeEvent);if(l===null){l=n.nativeEvent;var h=new l.constructor(l.type,l);Lt=h,l.target.dispatchEvent(h),Lt=null}else return s=ia(l),s!==null&&qc(s),n.blockedOn=l,!1;s.shift()}return!0}function Xd(n,s,l){Qa(n)&&l.delete(s)}function __(){Kc=!1,yr!==null&&Qa(yr)&&(yr=null),Sr!==null&&Qa(Sr)&&(Sr=null),Mr!==null&&Qa(Mr)&&(Mr=null),Ho.forEach(Xd),Vo.forEach(Xd)}function Wo(n,s){n.blockedOn===s&&(n.blockedOn=null,Kc||(Kc=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,__)))}function Xo(n){function s(p){return Wo(p,n)}if(0<Za.length){Wo(Za[0],n);for(var l=1;l<Za.length;l++){var h=Za[l];h.blockedOn===n&&(h.blockedOn=null)}}for(yr!==null&&Wo(yr,n),Sr!==null&&Wo(Sr,n),Mr!==null&&Wo(Mr,n),Ho.forEach(s),Vo.forEach(s),l=0;l<wr.length;l++)h=wr[l],h.blockedOn===n&&(h.blockedOn=null);for(;0<wr.length&&(l=wr[0],l.blockedOn===null);)Wd(l),l.blockedOn===null&&wr.shift()}var Ls=T.ReactCurrentBatchConfig,Ja=!0;function x_(n,s,l,h){var p=Dt,x=Ls.transition;Ls.transition=null;try{Dt=1,$c(n,s,l,h)}finally{Dt=p,Ls.transition=x}}function y_(n,s,l,h){var p=Dt,x=Ls.transition;Ls.transition=null;try{Dt=4,$c(n,s,l,h)}finally{Dt=p,Ls.transition=x}}function $c(n,s,l,h){if(Ja){var p=Zc(n,s,l,h);if(p===null)pu(n,s,h,el,l),Gd(n,h);else if(v_(p,n,s,l,h))h.stopPropagation();else if(Gd(n,h),s&4&&-1<g_.indexOf(n)){for(;p!==null;){var x=ia(p);if(x!==null&&zd(x),x=Zc(n,s,l,h),x===null&&pu(n,s,h,el,l),x===p)break;p=x}p!==null&&h.stopPropagation()}else pu(n,s,h,null,l)}}var el=null;function Zc(n,s,l,h){if(el=null,n=X(h),n=Jr(n),n!==null)if(s=Ii(n),s===null)n=null;else if(l=s.tag,l===13){if(n=qa(s),n!==null)return n;n=null}else if(l===3){if(s.stateNode.current.memoizedState.isDehydrated)return s.tag===3?s.stateNode.containerInfo:null;n=null}else s!==n&&(n=null);return el=n,null}function jd(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Je()){case Ke:return 1;case lt:return 4;case ut:case et:return 16;case Mt:return 536870912;default:return 16}default:return 16}}var Er=null,Qc=null,tl=null;function Yd(){if(tl)return tl;var n,s=Qc,l=s.length,h,p="value"in Er?Er.value:Er.textContent,x=p.length;for(n=0;n<l&&s[n]===p[n];n++);var E=l-n;for(h=1;h<=E&&s[l-h]===p[x-h];h++);return tl=p.slice(n,1<h?1-h:void 0)}function nl(n){var s=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&s===13&&(n=13)):n=s,n===10&&(n=13),32<=n||n===13?n:0}function il(){return!0}function qd(){return!1}function Zn(n){function s(l,h,p,x,E){this._reactName=l,this._targetInst=p,this.type=h,this.nativeEvent=x,this.target=E,this.currentTarget=null;for(var U in n)n.hasOwnProperty(U)&&(l=n[U],this[U]=l?l(x):x[U]);return this.isDefaultPrevented=(x.defaultPrevented!=null?x.defaultPrevented:x.returnValue===!1)?il:qd,this.isPropagationStopped=qd,this}return ae(s.prototype,{preventDefault:function(){this.defaultPrevented=!0;var l=this.nativeEvent;l&&(l.preventDefault?l.preventDefault():typeof l.returnValue!="unknown"&&(l.returnValue=!1),this.isDefaultPrevented=il)},stopPropagation:function(){var l=this.nativeEvent;l&&(l.stopPropagation?l.stopPropagation():typeof l.cancelBubble!="unknown"&&(l.cancelBubble=!0),this.isPropagationStopped=il)},persist:function(){},isPersistent:il}),s}var Ds={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Jc=Zn(Ds),jo=ae({},Ds,{view:0,detail:0}),S_=Zn(jo),eu,tu,Yo,rl=ae({},jo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:iu,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==Yo&&(Yo&&n.type==="mousemove"?(eu=n.screenX-Yo.screenX,tu=n.screenY-Yo.screenY):tu=eu=0,Yo=n),eu)},movementY:function(n){return"movementY"in n?n.movementY:tu}}),Kd=Zn(rl),M_=ae({},rl,{dataTransfer:0}),w_=Zn(M_),E_=ae({},jo,{relatedTarget:0}),nu=Zn(E_),T_=ae({},Ds,{animationName:0,elapsedTime:0,pseudoElement:0}),A_=Zn(T_),C_=ae({},Ds,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),R_=Zn(C_),P_=ae({},Ds,{data:0}),$d=Zn(P_),b_={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},L_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},D_={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function I_(n){var s=this.nativeEvent;return s.getModifierState?s.getModifierState(n):(n=D_[n])?!!s[n]:!1}function iu(){return I_}var N_=ae({},jo,{key:function(n){if(n.key){var s=b_[n.key]||n.key;if(s!=="Unidentified")return s}return n.type==="keypress"?(n=nl(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?L_[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:iu,charCode:function(n){return n.type==="keypress"?nl(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?nl(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),U_=Zn(N_),F_=ae({},rl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Zd=Zn(F_),O_=ae({},jo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:iu}),k_=Zn(O_),z_=ae({},Ds,{propertyName:0,elapsedTime:0,pseudoElement:0}),B_=Zn(z_),H_=ae({},rl,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),V_=Zn(H_),G_=[9,13,27,32],ru=u&&"CompositionEvent"in window,qo=null;u&&"documentMode"in document&&(qo=document.documentMode);var W_=u&&"TextEvent"in window&&!qo,Qd=u&&(!ru||qo&&8<qo&&11>=qo),Jd=" ",ep=!1;function tp(n,s){switch(n){case"keyup":return G_.indexOf(s.keyCode)!==-1;case"keydown":return s.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function np(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var Is=!1;function X_(n,s){switch(n){case"compositionend":return np(s);case"keypress":return s.which!==32?null:(ep=!0,Jd);case"textInput":return n=s.data,n===Jd&&ep?null:n;default:return null}}function j_(n,s){if(Is)return n==="compositionend"||!ru&&tp(n,s)?(n=Yd(),tl=Qc=Er=null,Is=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(s.ctrlKey||s.altKey||s.metaKey)||s.ctrlKey&&s.altKey){if(s.char&&1<s.char.length)return s.char;if(s.which)return String.fromCharCode(s.which)}return null;case"compositionend":return Qd&&s.locale!=="ko"?null:s.data;default:return null}}var Y_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function ip(n){var s=n&&n.nodeName&&n.nodeName.toLowerCase();return s==="input"?!!Y_[n.type]:s==="textarea"}function rp(n,s,l,h){Ue(h),s=cl(s,"onChange"),0<s.length&&(l=new Jc("onChange","change",null,l,h),n.push({event:l,listeners:s}))}var Ko=null,$o=null;function q_(n){Mp(n,0)}function sl(n){var s=ks(n);if(_e(s))return n}function K_(n,s){if(n==="change")return s}var sp=!1;if(u){var su;if(u){var ou="oninput"in document;if(!ou){var op=document.createElement("div");op.setAttribute("oninput","return;"),ou=typeof op.oninput=="function"}su=ou}else su=!1;sp=su&&(!document.documentMode||9<document.documentMode)}function ap(){Ko&&(Ko.detachEvent("onpropertychange",lp),$o=Ko=null)}function lp(n){if(n.propertyName==="value"&&sl($o)){var s=[];rp(s,$o,n,X(n)),Bn(q_,s)}}function $_(n,s,l){n==="focusin"?(ap(),Ko=s,$o=l,Ko.attachEvent("onpropertychange",lp)):n==="focusout"&&ap()}function Z_(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return sl($o)}function Q_(n,s){if(n==="click")return sl(s)}function J_(n,s){if(n==="input"||n==="change")return sl(s)}function ex(n,s){return n===s&&(n!==0||1/n===1/s)||n!==n&&s!==s}var Si=typeof Object.is=="function"?Object.is:ex;function Zo(n,s){if(Si(n,s))return!0;if(typeof n!="object"||n===null||typeof s!="object"||s===null)return!1;var l=Object.keys(n),h=Object.keys(s);if(l.length!==h.length)return!1;for(h=0;h<l.length;h++){var p=l[h];if(!f.call(s,p)||!Si(n[p],s[p]))return!1}return!0}function cp(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function up(n,s){var l=cp(n);n=0;for(var h;l;){if(l.nodeType===3){if(h=n+l.textContent.length,n<=s&&h>=s)return{node:l,offset:s-n};n=h}e:{for(;l;){if(l.nextSibling){l=l.nextSibling;break e}l=l.parentNode}l=void 0}l=cp(l)}}function hp(n,s){return n&&s?n===s?!0:n&&n.nodeType===3?!1:s&&s.nodeType===3?hp(n,s.parentNode):"contains"in n?n.contains(s):n.compareDocumentPosition?!!(n.compareDocumentPosition(s)&16):!1:!1}function fp(){for(var n=window,s=Re();s instanceof n.HTMLIFrameElement;){try{var l=typeof s.contentWindow.location.href=="string"}catch{l=!1}if(l)n=s.contentWindow;else break;s=Re(n.document)}return s}function au(n){var s=n&&n.nodeName&&n.nodeName.toLowerCase();return s&&(s==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||s==="textarea"||n.contentEditable==="true")}function tx(n){var s=fp(),l=n.focusedElem,h=n.selectionRange;if(s!==l&&l&&l.ownerDocument&&hp(l.ownerDocument.documentElement,l)){if(h!==null&&au(l)){if(s=h.start,n=h.end,n===void 0&&(n=s),"selectionStart"in l)l.selectionStart=s,l.selectionEnd=Math.min(n,l.value.length);else if(n=(s=l.ownerDocument||document)&&s.defaultView||window,n.getSelection){n=n.getSelection();var p=l.textContent.length,x=Math.min(h.start,p);h=h.end===void 0?x:Math.min(h.end,p),!n.extend&&x>h&&(p=h,h=x,x=p),p=up(l,x);var E=up(l,h);p&&E&&(n.rangeCount!==1||n.anchorNode!==p.node||n.anchorOffset!==p.offset||n.focusNode!==E.node||n.focusOffset!==E.offset)&&(s=s.createRange(),s.setStart(p.node,p.offset),n.removeAllRanges(),x>h?(n.addRange(s),n.extend(E.node,E.offset)):(s.setEnd(E.node,E.offset),n.addRange(s)))}}for(s=[],n=l;n=n.parentNode;)n.nodeType===1&&s.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<s.length;l++)n=s[l],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var nx=u&&"documentMode"in document&&11>=document.documentMode,Ns=null,lu=null,Qo=null,cu=!1;function dp(n,s,l){var h=l.window===l?l.document:l.nodeType===9?l:l.ownerDocument;cu||Ns==null||Ns!==Re(h)||(h=Ns,"selectionStart"in h&&au(h)?h={start:h.selectionStart,end:h.selectionEnd}:(h=(h.ownerDocument&&h.ownerDocument.defaultView||window).getSelection(),h={anchorNode:h.anchorNode,anchorOffset:h.anchorOffset,focusNode:h.focusNode,focusOffset:h.focusOffset}),Qo&&Zo(Qo,h)||(Qo=h,h=cl(lu,"onSelect"),0<h.length&&(s=new Jc("onSelect","select",null,s,l),n.push({event:s,listeners:h}),s.target=Ns)))}function ol(n,s){var l={};return l[n.toLowerCase()]=s.toLowerCase(),l["Webkit"+n]="webkit"+s,l["Moz"+n]="moz"+s,l}var Us={animationend:ol("Animation","AnimationEnd"),animationiteration:ol("Animation","AnimationIteration"),animationstart:ol("Animation","AnimationStart"),transitionend:ol("Transition","TransitionEnd")},uu={},pp={};u&&(pp=document.createElement("div").style,"AnimationEvent"in window||(delete Us.animationend.animation,delete Us.animationiteration.animation,delete Us.animationstart.animation),"TransitionEvent"in window||delete Us.transitionend.transition);function al(n){if(uu[n])return uu[n];if(!Us[n])return n;var s=Us[n],l;for(l in s)if(s.hasOwnProperty(l)&&l in pp)return uu[n]=s[l];return n}var mp=al("animationend"),gp=al("animationiteration"),vp=al("animationstart"),_p=al("transitionend"),xp=new Map,yp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Tr(n,s){xp.set(n,s),a(s,[n])}for(var hu=0;hu<yp.length;hu++){var fu=yp[hu],ix=fu.toLowerCase(),rx=fu[0].toUpperCase()+fu.slice(1);Tr(ix,"on"+rx)}Tr(mp,"onAnimationEnd"),Tr(gp,"onAnimationIteration"),Tr(vp,"onAnimationStart"),Tr("dblclick","onDoubleClick"),Tr("focusin","onFocus"),Tr("focusout","onBlur"),Tr(_p,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),a("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),a("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),a("onBeforeInput",["compositionend","keypress","textInput","paste"]),a("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),a("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),a("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Jo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),sx=new Set("cancel close invalid load scroll toggle".split(" ").concat(Jo));function Sp(n,s,l){var h=n.type||"unknown-event";n.currentTarget=l,Ya(h,s,void 0,n),n.currentTarget=null}function Mp(n,s){s=(s&4)!==0;for(var l=0;l<n.length;l++){var h=n[l],p=h.event;h=h.listeners;e:{var x=void 0;if(s)for(var E=h.length-1;0<=E;E--){var U=h[E],H=U.instance,te=U.currentTarget;if(U=U.listener,H!==x&&p.isPropagationStopped())break e;Sp(p,U,te),x=H}else for(E=0;E<h.length;E++){if(U=h[E],H=U.instance,te=U.currentTarget,U=U.listener,H!==x&&p.isPropagationStopped())break e;Sp(p,U,te),x=H}}}if(Qr)throw n=xr,Qr=!1,xr=null,n}function kt(n,s){var l=s[yu];l===void 0&&(l=s[yu]=new Set);var h=n+"__bubble";l.has(h)||(wp(s,n,2,!1),l.add(h))}function du(n,s,l){var h=0;s&&(h|=4),wp(l,n,h,s)}var ll="_reactListening"+Math.random().toString(36).slice(2);function ea(n){if(!n[ll]){n[ll]=!0,r.forEach(function(l){l!=="selectionchange"&&(sx.has(l)||du(l,!1,n),du(l,!0,n))});var s=n.nodeType===9?n:n.ownerDocument;s===null||s[ll]||(s[ll]=!0,du("selectionchange",!1,s))}}function wp(n,s,l,h){switch(jd(s)){case 1:var p=x_;break;case 4:p=y_;break;default:p=$c}l=p.bind(null,s,l,n),p=void 0,!Ps||s!=="touchstart"&&s!=="touchmove"&&s!=="wheel"||(p=!0),h?p!==void 0?n.addEventListener(s,l,{capture:!0,passive:p}):n.addEventListener(s,l,!0):p!==void 0?n.addEventListener(s,l,{passive:p}):n.addEventListener(s,l,!1)}function pu(n,s,l,h,p){var x=h;if((s&1)===0&&(s&2)===0&&h!==null)e:for(;;){if(h===null)return;var E=h.tag;if(E===3||E===4){var U=h.stateNode.containerInfo;if(U===p||U.nodeType===8&&U.parentNode===p)break;if(E===4)for(E=h.return;E!==null;){var H=E.tag;if((H===3||H===4)&&(H=E.stateNode.containerInfo,H===p||H.nodeType===8&&H.parentNode===p))return;E=E.return}for(;U!==null;){if(E=Jr(U),E===null)return;if(H=E.tag,H===5||H===6){h=x=E;continue e}U=U.parentNode}}h=h.return}Bn(function(){var te=x,Se=X(l),Me=[];e:{var ye=xp.get(n);if(ye!==void 0){var He=Jc,Ye=n;switch(n){case"keypress":if(nl(l)===0)break e;case"keydown":case"keyup":He=U_;break;case"focusin":Ye="focus",He=nu;break;case"focusout":Ye="blur",He=nu;break;case"beforeblur":case"afterblur":He=nu;break;case"click":if(l.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":He=Kd;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":He=w_;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":He=k_;break;case mp:case gp:case vp:He=A_;break;case _p:He=B_;break;case"scroll":He=S_;break;case"wheel":He=V_;break;case"copy":case"cut":case"paste":He=R_;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":He=Zd}var $e=(s&4)!==0,Yt=!$e&&n==="scroll",K=$e?ye!==null?ye+"Capture":null:ye;$e=[];for(var W=te,Q;W!==null;){Q=W;var Pe=Q.stateNode;if(Q.tag===5&&Pe!==null&&(Q=Pe,K!==null&&(Pe=bn(W,K),Pe!=null&&$e.push(ta(W,Pe,Q)))),Yt)break;W=W.return}0<$e.length&&(ye=new He(ye,Ye,null,l,Se),Me.push({event:ye,listeners:$e}))}}if((s&7)===0){e:{if(ye=n==="mouseover"||n==="pointerover",He=n==="mouseout"||n==="pointerout",ye&&l!==Lt&&(Ye=l.relatedTarget||l.fromElement)&&(Jr(Ye)||Ye[Zi]))break e;if((He||ye)&&(ye=Se.window===Se?Se:(ye=Se.ownerDocument)?ye.defaultView||ye.parentWindow:window,He?(Ye=l.relatedTarget||l.toElement,He=te,Ye=Ye?Jr(Ye):null,Ye!==null&&(Yt=Ii(Ye),Ye!==Yt||Ye.tag!==5&&Ye.tag!==6)&&(Ye=null)):(He=null,Ye=te),He!==Ye)){if($e=Kd,Pe="onMouseLeave",K="onMouseEnter",W="mouse",(n==="pointerout"||n==="pointerover")&&($e=Zd,Pe="onPointerLeave",K="onPointerEnter",W="pointer"),Yt=He==null?ye:ks(He),Q=Ye==null?ye:ks(Ye),ye=new $e(Pe,W+"leave",He,l,Se),ye.target=Yt,ye.relatedTarget=Q,Pe=null,Jr(Se)===te&&($e=new $e(K,W+"enter",Ye,l,Se),$e.target=Q,$e.relatedTarget=Yt,Pe=$e),Yt=Pe,He&&Ye)t:{for($e=He,K=Ye,W=0,Q=$e;Q;Q=Fs(Q))W++;for(Q=0,Pe=K;Pe;Pe=Fs(Pe))Q++;for(;0<W-Q;)$e=Fs($e),W--;for(;0<Q-W;)K=Fs(K),Q--;for(;W--;){if($e===K||K!==null&&$e===K.alternate)break t;$e=Fs($e),K=Fs(K)}$e=null}else $e=null;He!==null&&Ep(Me,ye,He,$e,!1),Ye!==null&&Yt!==null&&Ep(Me,Yt,Ye,$e,!0)}}e:{if(ye=te?ks(te):window,He=ye.nodeName&&ye.nodeName.toLowerCase(),He==="select"||He==="input"&&ye.type==="file")var tt=K_;else if(ip(ye))if(sp)tt=J_;else{tt=Z_;var rt=$_}else(He=ye.nodeName)&&He.toLowerCase()==="input"&&(ye.type==="checkbox"||ye.type==="radio")&&(tt=Q_);if(tt&&(tt=tt(n,te))){rp(Me,tt,l,Se);break e}rt&&rt(n,ye,te),n==="focusout"&&(rt=ye._wrapperState)&&rt.controlled&&ye.type==="number"&&it(ye,"number",ye.value)}switch(rt=te?ks(te):window,n){case"focusin":(ip(rt)||rt.contentEditable==="true")&&(Ns=rt,lu=te,Qo=null);break;case"focusout":Qo=lu=Ns=null;break;case"mousedown":cu=!0;break;case"contextmenu":case"mouseup":case"dragend":cu=!1,dp(Me,l,Se);break;case"selectionchange":if(nx)break;case"keydown":case"keyup":dp(Me,l,Se)}var st;if(ru)e:{switch(n){case"compositionstart":var ct="onCompositionStart";break e;case"compositionend":ct="onCompositionEnd";break e;case"compositionupdate":ct="onCompositionUpdate";break e}ct=void 0}else Is?tp(n,l)&&(ct="onCompositionEnd"):n==="keydown"&&l.keyCode===229&&(ct="onCompositionStart");ct&&(Qd&&l.locale!=="ko"&&(Is||ct!=="onCompositionStart"?ct==="onCompositionEnd"&&Is&&(st=Yd()):(Er=Se,Qc="value"in Er?Er.value:Er.textContent,Is=!0)),rt=cl(te,ct),0<rt.length&&(ct=new $d(ct,n,null,l,Se),Me.push({event:ct,listeners:rt}),st?ct.data=st:(st=np(l),st!==null&&(ct.data=st)))),(st=W_?X_(n,l):j_(n,l))&&(te=cl(te,"onBeforeInput"),0<te.length&&(Se=new $d("onBeforeInput","beforeinput",null,l,Se),Me.push({event:Se,listeners:te}),Se.data=st))}Mp(Me,s)})}function ta(n,s,l){return{instance:n,listener:s,currentTarget:l}}function cl(n,s){for(var l=s+"Capture",h=[];n!==null;){var p=n,x=p.stateNode;p.tag===5&&x!==null&&(p=x,x=bn(n,l),x!=null&&h.unshift(ta(n,x,p)),x=bn(n,s),x!=null&&h.push(ta(n,x,p))),n=n.return}return h}function Fs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function Ep(n,s,l,h,p){for(var x=s._reactName,E=[];l!==null&&l!==h;){var U=l,H=U.alternate,te=U.stateNode;if(H!==null&&H===h)break;U.tag===5&&te!==null&&(U=te,p?(H=bn(l,x),H!=null&&E.unshift(ta(l,H,U))):p||(H=bn(l,x),H!=null&&E.push(ta(l,H,U)))),l=l.return}E.length!==0&&n.push({event:s,listeners:E})}var ox=/\r\n?/g,ax=/\u0000|\uFFFD/g;function Tp(n){return(typeof n=="string"?n:""+n).replace(ox,`
`).replace(ax,"")}function ul(n,s,l){if(s=Tp(s),Tp(n)!==s&&l)throw Error(t(425))}function hl(){}var mu=null,gu=null;function vu(n,s){return n==="textarea"||n==="noscript"||typeof s.children=="string"||typeof s.children=="number"||typeof s.dangerouslySetInnerHTML=="object"&&s.dangerouslySetInnerHTML!==null&&s.dangerouslySetInnerHTML.__html!=null}var _u=typeof setTimeout=="function"?setTimeout:void 0,lx=typeof clearTimeout=="function"?clearTimeout:void 0,Ap=typeof Promise=="function"?Promise:void 0,cx=typeof queueMicrotask=="function"?queueMicrotask:typeof Ap<"u"?function(n){return Ap.resolve(null).then(n).catch(ux)}:_u;function ux(n){setTimeout(function(){throw n})}function xu(n,s){var l=s,h=0;do{var p=l.nextSibling;if(n.removeChild(l),p&&p.nodeType===8)if(l=p.data,l==="/$"){if(h===0){n.removeChild(p),Xo(s);return}h--}else l!=="$"&&l!=="$?"&&l!=="$!"||h++;l=p}while(l);Xo(s)}function Ar(n){for(;n!=null;n=n.nextSibling){var s=n.nodeType;if(s===1||s===3)break;if(s===8){if(s=n.data,s==="$"||s==="$!"||s==="$?")break;if(s==="/$")return null}}return n}function Cp(n){n=n.previousSibling;for(var s=0;n;){if(n.nodeType===8){var l=n.data;if(l==="$"||l==="$!"||l==="$?"){if(s===0)return n;s--}else l==="/$"&&s++}n=n.previousSibling}return null}var Os=Math.random().toString(36).slice(2),Ui="__reactFiber$"+Os,na="__reactProps$"+Os,Zi="__reactContainer$"+Os,yu="__reactEvents$"+Os,hx="__reactListeners$"+Os,fx="__reactHandles$"+Os;function Jr(n){var s=n[Ui];if(s)return s;for(var l=n.parentNode;l;){if(s=l[Zi]||l[Ui]){if(l=s.alternate,s.child!==null||l!==null&&l.child!==null)for(n=Cp(n);n!==null;){if(l=n[Ui])return l;n=Cp(n)}return s}n=l,l=n.parentNode}return null}function ia(n){return n=n[Ui]||n[Zi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function ks(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function fl(n){return n[na]||null}var Su=[],zs=-1;function Cr(n){return{current:n}}function zt(n){0>zs||(n.current=Su[zs],Su[zs]=null,zs--)}function Ft(n,s){zs++,Su[zs]=n.current,n.current=s}var Rr={},Sn=Cr(Rr),Vn=Cr(!1),es=Rr;function Bs(n,s){var l=n.type.contextTypes;if(!l)return Rr;var h=n.stateNode;if(h&&h.__reactInternalMemoizedUnmaskedChildContext===s)return h.__reactInternalMemoizedMaskedChildContext;var p={},x;for(x in l)p[x]=s[x];return h&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=s,n.__reactInternalMemoizedMaskedChildContext=p),p}function Gn(n){return n=n.childContextTypes,n!=null}function dl(){zt(Vn),zt(Sn)}function Rp(n,s,l){if(Sn.current!==Rr)throw Error(t(168));Ft(Sn,s),Ft(Vn,l)}function Pp(n,s,l){var h=n.stateNode;if(s=s.childContextTypes,typeof h.getChildContext!="function")return l;h=h.getChildContext();for(var p in h)if(!(p in s))throw Error(t(108,ve(n)||"Unknown",p));return ae({},l,h)}function pl(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Rr,es=Sn.current,Ft(Sn,n),Ft(Vn,Vn.current),!0}function bp(n,s,l){var h=n.stateNode;if(!h)throw Error(t(169));l?(n=Pp(n,s,es),h.__reactInternalMemoizedMergedChildContext=n,zt(Vn),zt(Sn),Ft(Sn,n)):zt(Vn),Ft(Vn,l)}var Qi=null,ml=!1,Mu=!1;function Lp(n){Qi===null?Qi=[n]:Qi.push(n)}function dx(n){ml=!0,Lp(n)}function Pr(){if(!Mu&&Qi!==null){Mu=!0;var n=0,s=Dt;try{var l=Qi;for(Dt=1;n<l.length;n++){var h=l[n];do h=h(!0);while(h!==null)}Qi=null,ml=!1}catch(p){throw Qi!==null&&(Qi=Qi.slice(n+1)),ne(Ke,Pr),p}finally{Dt=s,Mu=!1}}return null}var Hs=[],Vs=0,gl=null,vl=0,ai=[],li=0,ts=null,Ji=1,er="";function ns(n,s){Hs[Vs++]=vl,Hs[Vs++]=gl,gl=n,vl=s}function Dp(n,s,l){ai[li++]=Ji,ai[li++]=er,ai[li++]=ts,ts=n;var h=Ji;n=er;var p=32-mt(h)-1;h&=~(1<<p),l+=1;var x=32-mt(s)+p;if(30<x){var E=p-p%5;x=(h&(1<<E)-1).toString(32),h>>=E,p-=E,Ji=1<<32-mt(s)+p|l<<p|h,er=x+n}else Ji=1<<x|l<<p|h,er=n}function wu(n){n.return!==null&&(ns(n,1),Dp(n,1,0))}function Eu(n){for(;n===gl;)gl=Hs[--Vs],Hs[Vs]=null,vl=Hs[--Vs],Hs[Vs]=null;for(;n===ts;)ts=ai[--li],ai[li]=null,er=ai[--li],ai[li]=null,Ji=ai[--li],ai[li]=null}var Qn=null,Jn=null,Bt=!1,Mi=null;function Ip(n,s){var l=fi(5,null,null,0);l.elementType="DELETED",l.stateNode=s,l.return=n,s=n.deletions,s===null?(n.deletions=[l],n.flags|=16):s.push(l)}function Np(n,s){switch(n.tag){case 5:var l=n.type;return s=s.nodeType!==1||l.toLowerCase()!==s.nodeName.toLowerCase()?null:s,s!==null?(n.stateNode=s,Qn=n,Jn=Ar(s.firstChild),!0):!1;case 6:return s=n.pendingProps===""||s.nodeType!==3?null:s,s!==null?(n.stateNode=s,Qn=n,Jn=null,!0):!1;case 13:return s=s.nodeType!==8?null:s,s!==null?(l=ts!==null?{id:Ji,overflow:er}:null,n.memoizedState={dehydrated:s,treeContext:l,retryLane:1073741824},l=fi(18,null,null,0),l.stateNode=s,l.return=n,n.child=l,Qn=n,Jn=null,!0):!1;default:return!1}}function Tu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function Au(n){if(Bt){var s=Jn;if(s){var l=s;if(!Np(n,s)){if(Tu(n))throw Error(t(418));s=Ar(l.nextSibling);var h=Qn;s&&Np(n,s)?Ip(h,l):(n.flags=n.flags&-4097|2,Bt=!1,Qn=n)}}else{if(Tu(n))throw Error(t(418));n.flags=n.flags&-4097|2,Bt=!1,Qn=n}}}function Up(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;Qn=n}function _l(n){if(n!==Qn)return!1;if(!Bt)return Up(n),Bt=!0,!1;var s;if((s=n.tag!==3)&&!(s=n.tag!==5)&&(s=n.type,s=s!=="head"&&s!=="body"&&!vu(n.type,n.memoizedProps)),s&&(s=Jn)){if(Tu(n))throw Fp(),Error(t(418));for(;s;)Ip(n,s),s=Ar(s.nextSibling)}if(Up(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,s=0;n;){if(n.nodeType===8){var l=n.data;if(l==="/$"){if(s===0){Jn=Ar(n.nextSibling);break e}s--}else l!=="$"&&l!=="$!"&&l!=="$?"||s++}n=n.nextSibling}Jn=null}}else Jn=Qn?Ar(n.stateNode.nextSibling):null;return!0}function Fp(){for(var n=Jn;n;)n=Ar(n.nextSibling)}function Gs(){Jn=Qn=null,Bt=!1}function Cu(n){Mi===null?Mi=[n]:Mi.push(n)}var px=T.ReactCurrentBatchConfig;function ra(n,s,l){if(n=l.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(l._owner){if(l=l._owner,l){if(l.tag!==1)throw Error(t(309));var h=l.stateNode}if(!h)throw Error(t(147,n));var p=h,x=""+n;return s!==null&&s.ref!==null&&typeof s.ref=="function"&&s.ref._stringRef===x?s.ref:(s=function(E){var U=p.refs;E===null?delete U[x]:U[x]=E},s._stringRef=x,s)}if(typeof n!="string")throw Error(t(284));if(!l._owner)throw Error(t(290,n))}return n}function xl(n,s){throw n=Object.prototype.toString.call(s),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(s).join(", ")+"}":n))}function Op(n){var s=n._init;return s(n._payload)}function kp(n){function s(K,W){if(n){var Q=K.deletions;Q===null?(K.deletions=[W],K.flags|=16):Q.push(W)}}function l(K,W){if(!n)return null;for(;W!==null;)s(K,W),W=W.sibling;return null}function h(K,W){for(K=new Map;W!==null;)W.key!==null?K.set(W.key,W):K.set(W.index,W),W=W.sibling;return K}function p(K,W){return K=Or(K,W),K.index=0,K.sibling=null,K}function x(K,W,Q){return K.index=Q,n?(Q=K.alternate,Q!==null?(Q=Q.index,Q<W?(K.flags|=2,W):Q):(K.flags|=2,W)):(K.flags|=1048576,W)}function E(K){return n&&K.alternate===null&&(K.flags|=2),K}function U(K,W,Q,Pe){return W===null||W.tag!==6?(W=_h(Q,K.mode,Pe),W.return=K,W):(W=p(W,Q),W.return=K,W)}function H(K,W,Q,Pe){var tt=Q.type;return tt===N?Se(K,W,Q.props.children,Pe,Q.key):W!==null&&(W.elementType===tt||typeof tt=="object"&&tt!==null&&tt.$$typeof===oe&&Op(tt)===W.type)?(Pe=p(W,Q.props),Pe.ref=ra(K,W,Q),Pe.return=K,Pe):(Pe=Gl(Q.type,Q.key,Q.props,null,K.mode,Pe),Pe.ref=ra(K,W,Q),Pe.return=K,Pe)}function te(K,W,Q,Pe){return W===null||W.tag!==4||W.stateNode.containerInfo!==Q.containerInfo||W.stateNode.implementation!==Q.implementation?(W=xh(Q,K.mode,Pe),W.return=K,W):(W=p(W,Q.children||[]),W.return=K,W)}function Se(K,W,Q,Pe,tt){return W===null||W.tag!==7?(W=us(Q,K.mode,Pe,tt),W.return=K,W):(W=p(W,Q),W.return=K,W)}function Me(K,W,Q){if(typeof W=="string"&&W!==""||typeof W=="number")return W=_h(""+W,K.mode,Q),W.return=K,W;if(typeof W=="object"&&W!==null){switch(W.$$typeof){case V:return Q=Gl(W.type,W.key,W.props,null,K.mode,Q),Q.ref=ra(K,null,W),Q.return=K,Q;case I:return W=xh(W,K.mode,Q),W.return=K,W;case oe:var Pe=W._init;return Me(K,Pe(W._payload),Q)}if(Oe(W)||he(W))return W=us(W,K.mode,Q,null),W.return=K,W;xl(K,W)}return null}function ye(K,W,Q,Pe){var tt=W!==null?W.key:null;if(typeof Q=="string"&&Q!==""||typeof Q=="number")return tt!==null?null:U(K,W,""+Q,Pe);if(typeof Q=="object"&&Q!==null){switch(Q.$$typeof){case V:return Q.key===tt?H(K,W,Q,Pe):null;case I:return Q.key===tt?te(K,W,Q,Pe):null;case oe:return tt=Q._init,ye(K,W,tt(Q._payload),Pe)}if(Oe(Q)||he(Q))return tt!==null?null:Se(K,W,Q,Pe,null);xl(K,Q)}return null}function He(K,W,Q,Pe,tt){if(typeof Pe=="string"&&Pe!==""||typeof Pe=="number")return K=K.get(Q)||null,U(W,K,""+Pe,tt);if(typeof Pe=="object"&&Pe!==null){switch(Pe.$$typeof){case V:return K=K.get(Pe.key===null?Q:Pe.key)||null,H(W,K,Pe,tt);case I:return K=K.get(Pe.key===null?Q:Pe.key)||null,te(W,K,Pe,tt);case oe:var rt=Pe._init;return He(K,W,Q,rt(Pe._payload),tt)}if(Oe(Pe)||he(Pe))return K=K.get(Q)||null,Se(W,K,Pe,tt,null);xl(W,Pe)}return null}function Ye(K,W,Q,Pe){for(var tt=null,rt=null,st=W,ct=W=0,cn=null;st!==null&&ct<Q.length;ct++){st.index>ct?(cn=st,st=null):cn=st.sibling;var Rt=ye(K,st,Q[ct],Pe);if(Rt===null){st===null&&(st=cn);break}n&&st&&Rt.alternate===null&&s(K,st),W=x(Rt,W,ct),rt===null?tt=Rt:rt.sibling=Rt,rt=Rt,st=cn}if(ct===Q.length)return l(K,st),Bt&&ns(K,ct),tt;if(st===null){for(;ct<Q.length;ct++)st=Me(K,Q[ct],Pe),st!==null&&(W=x(st,W,ct),rt===null?tt=st:rt.sibling=st,rt=st);return Bt&&ns(K,ct),tt}for(st=h(K,st);ct<Q.length;ct++)cn=He(st,K,ct,Q[ct],Pe),cn!==null&&(n&&cn.alternate!==null&&st.delete(cn.key===null?ct:cn.key),W=x(cn,W,ct),rt===null?tt=cn:rt.sibling=cn,rt=cn);return n&&st.forEach(function(kr){return s(K,kr)}),Bt&&ns(K,ct),tt}function $e(K,W,Q,Pe){var tt=he(Q);if(typeof tt!="function")throw Error(t(150));if(Q=tt.call(Q),Q==null)throw Error(t(151));for(var rt=tt=null,st=W,ct=W=0,cn=null,Rt=Q.next();st!==null&&!Rt.done;ct++,Rt=Q.next()){st.index>ct?(cn=st,st=null):cn=st.sibling;var kr=ye(K,st,Rt.value,Pe);if(kr===null){st===null&&(st=cn);break}n&&st&&kr.alternate===null&&s(K,st),W=x(kr,W,ct),rt===null?tt=kr:rt.sibling=kr,rt=kr,st=cn}if(Rt.done)return l(K,st),Bt&&ns(K,ct),tt;if(st===null){for(;!Rt.done;ct++,Rt=Q.next())Rt=Me(K,Rt.value,Pe),Rt!==null&&(W=x(Rt,W,ct),rt===null?tt=Rt:rt.sibling=Rt,rt=Rt);return Bt&&ns(K,ct),tt}for(st=h(K,st);!Rt.done;ct++,Rt=Q.next())Rt=He(st,K,ct,Rt.value,Pe),Rt!==null&&(n&&Rt.alternate!==null&&st.delete(Rt.key===null?ct:Rt.key),W=x(Rt,W,ct),rt===null?tt=Rt:rt.sibling=Rt,rt=Rt);return n&&st.forEach(function(Yx){return s(K,Yx)}),Bt&&ns(K,ct),tt}function Yt(K,W,Q,Pe){if(typeof Q=="object"&&Q!==null&&Q.type===N&&Q.key===null&&(Q=Q.props.children),typeof Q=="object"&&Q!==null){switch(Q.$$typeof){case V:e:{for(var tt=Q.key,rt=W;rt!==null;){if(rt.key===tt){if(tt=Q.type,tt===N){if(rt.tag===7){l(K,rt.sibling),W=p(rt,Q.props.children),W.return=K,K=W;break e}}else if(rt.elementType===tt||typeof tt=="object"&&tt!==null&&tt.$$typeof===oe&&Op(tt)===rt.type){l(K,rt.sibling),W=p(rt,Q.props),W.ref=ra(K,rt,Q),W.return=K,K=W;break e}l(K,rt);break}else s(K,rt);rt=rt.sibling}Q.type===N?(W=us(Q.props.children,K.mode,Pe,Q.key),W.return=K,K=W):(Pe=Gl(Q.type,Q.key,Q.props,null,K.mode,Pe),Pe.ref=ra(K,W,Q),Pe.return=K,K=Pe)}return E(K);case I:e:{for(rt=Q.key;W!==null;){if(W.key===rt)if(W.tag===4&&W.stateNode.containerInfo===Q.containerInfo&&W.stateNode.implementation===Q.implementation){l(K,W.sibling),W=p(W,Q.children||[]),W.return=K,K=W;break e}else{l(K,W);break}else s(K,W);W=W.sibling}W=xh(Q,K.mode,Pe),W.return=K,K=W}return E(K);case oe:return rt=Q._init,Yt(K,W,rt(Q._payload),Pe)}if(Oe(Q))return Ye(K,W,Q,Pe);if(he(Q))return $e(K,W,Q,Pe);xl(K,Q)}return typeof Q=="string"&&Q!==""||typeof Q=="number"?(Q=""+Q,W!==null&&W.tag===6?(l(K,W.sibling),W=p(W,Q),W.return=K,K=W):(l(K,W),W=_h(Q,K.mode,Pe),W.return=K,K=W),E(K)):l(K,W)}return Yt}var Ws=kp(!0),zp=kp(!1),yl=Cr(null),Sl=null,Xs=null,Ru=null;function Pu(){Ru=Xs=Sl=null}function bu(n){var s=yl.current;zt(yl),n._currentValue=s}function Lu(n,s,l){for(;n!==null;){var h=n.alternate;if((n.childLanes&s)!==s?(n.childLanes|=s,h!==null&&(h.childLanes|=s)):h!==null&&(h.childLanes&s)!==s&&(h.childLanes|=s),n===l)break;n=n.return}}function js(n,s){Sl=n,Ru=Xs=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&s)!==0&&(Wn=!0),n.firstContext=null)}function ci(n){var s=n._currentValue;if(Ru!==n)if(n={context:n,memoizedValue:s,next:null},Xs===null){if(Sl===null)throw Error(t(308));Xs=n,Sl.dependencies={lanes:0,firstContext:n}}else Xs=Xs.next=n;return s}var is=null;function Du(n){is===null?is=[n]:is.push(n)}function Bp(n,s,l,h){var p=s.interleaved;return p===null?(l.next=l,Du(s)):(l.next=p.next,p.next=l),s.interleaved=l,tr(n,h)}function tr(n,s){n.lanes|=s;var l=n.alternate;for(l!==null&&(l.lanes|=s),l=n,n=n.return;n!==null;)n.childLanes|=s,l=n.alternate,l!==null&&(l.childLanes|=s),l=n,n=n.return;return l.tag===3?l.stateNode:null}var br=!1;function Iu(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Hp(n,s){n=n.updateQueue,s.updateQueue===n&&(s.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function nr(n,s){return{eventTime:n,lane:s,tag:0,payload:null,callback:null,next:null}}function Lr(n,s,l){var h=n.updateQueue;if(h===null)return null;if(h=h.shared,(Et&2)!==0){var p=h.pending;return p===null?s.next=s:(s.next=p.next,p.next=s),h.pending=s,tr(n,l)}return p=h.interleaved,p===null?(s.next=s,Du(h)):(s.next=p.next,p.next=s),h.interleaved=s,tr(n,l)}function Ml(n,s,l){if(s=s.updateQueue,s!==null&&(s=s.shared,(l&4194240)!==0)){var h=s.lanes;h&=n.pendingLanes,l|=h,s.lanes=l,Yc(n,l)}}function Vp(n,s){var l=n.updateQueue,h=n.alternate;if(h!==null&&(h=h.updateQueue,l===h)){var p=null,x=null;if(l=l.firstBaseUpdate,l!==null){do{var E={eventTime:l.eventTime,lane:l.lane,tag:l.tag,payload:l.payload,callback:l.callback,next:null};x===null?p=x=E:x=x.next=E,l=l.next}while(l!==null);x===null?p=x=s:x=x.next=s}else p=x=s;l={baseState:h.baseState,firstBaseUpdate:p,lastBaseUpdate:x,shared:h.shared,effects:h.effects},n.updateQueue=l;return}n=l.lastBaseUpdate,n===null?l.firstBaseUpdate=s:n.next=s,l.lastBaseUpdate=s}function wl(n,s,l,h){var p=n.updateQueue;br=!1;var x=p.firstBaseUpdate,E=p.lastBaseUpdate,U=p.shared.pending;if(U!==null){p.shared.pending=null;var H=U,te=H.next;H.next=null,E===null?x=te:E.next=te,E=H;var Se=n.alternate;Se!==null&&(Se=Se.updateQueue,U=Se.lastBaseUpdate,U!==E&&(U===null?Se.firstBaseUpdate=te:U.next=te,Se.lastBaseUpdate=H))}if(x!==null){var Me=p.baseState;E=0,Se=te=H=null,U=x;do{var ye=U.lane,He=U.eventTime;if((h&ye)===ye){Se!==null&&(Se=Se.next={eventTime:He,lane:0,tag:U.tag,payload:U.payload,callback:U.callback,next:null});e:{var Ye=n,$e=U;switch(ye=s,He=l,$e.tag){case 1:if(Ye=$e.payload,typeof Ye=="function"){Me=Ye.call(He,Me,ye);break e}Me=Ye;break e;case 3:Ye.flags=Ye.flags&-65537|128;case 0:if(Ye=$e.payload,ye=typeof Ye=="function"?Ye.call(He,Me,ye):Ye,ye==null)break e;Me=ae({},Me,ye);break e;case 2:br=!0}}U.callback!==null&&U.lane!==0&&(n.flags|=64,ye=p.effects,ye===null?p.effects=[U]:ye.push(U))}else He={eventTime:He,lane:ye,tag:U.tag,payload:U.payload,callback:U.callback,next:null},Se===null?(te=Se=He,H=Me):Se=Se.next=He,E|=ye;if(U=U.next,U===null){if(U=p.shared.pending,U===null)break;ye=U,U=ye.next,ye.next=null,p.lastBaseUpdate=ye,p.shared.pending=null}}while(!0);if(Se===null&&(H=Me),p.baseState=H,p.firstBaseUpdate=te,p.lastBaseUpdate=Se,s=p.shared.interleaved,s!==null){p=s;do E|=p.lane,p=p.next;while(p!==s)}else x===null&&(p.shared.lanes=0);os|=E,n.lanes=E,n.memoizedState=Me}}function Gp(n,s,l){if(n=s.effects,s.effects=null,n!==null)for(s=0;s<n.length;s++){var h=n[s],p=h.callback;if(p!==null){if(h.callback=null,h=l,typeof p!="function")throw Error(t(191,p));p.call(h)}}}var sa={},Fi=Cr(sa),oa=Cr(sa),aa=Cr(sa);function rs(n){if(n===sa)throw Error(t(174));return n}function Nu(n,s){switch(Ft(aa,s),Ft(oa,n),Ft(Fi,sa),n=s.nodeType,n){case 9:case 11:s=(s=s.documentElement)?s.namespaceURI:qe(null,"");break;default:n=n===8?s.parentNode:s,s=n.namespaceURI||null,n=n.tagName,s=qe(s,n)}zt(Fi),Ft(Fi,s)}function Ys(){zt(Fi),zt(oa),zt(aa)}function Wp(n){rs(aa.current);var s=rs(Fi.current),l=qe(s,n.type);s!==l&&(Ft(oa,n),Ft(Fi,l))}function Uu(n){oa.current===n&&(zt(Fi),zt(oa))}var Vt=Cr(0);function El(n){for(var s=n;s!==null;){if(s.tag===13){var l=s.memoizedState;if(l!==null&&(l=l.dehydrated,l===null||l.data==="$?"||l.data==="$!"))return s}else if(s.tag===19&&s.memoizedProps.revealOrder!==void 0){if((s.flags&128)!==0)return s}else if(s.child!==null){s.child.return=s,s=s.child;continue}if(s===n)break;for(;s.sibling===null;){if(s.return===null||s.return===n)return null;s=s.return}s.sibling.return=s.return,s=s.sibling}return null}var Fu=[];function Ou(){for(var n=0;n<Fu.length;n++)Fu[n]._workInProgressVersionPrimary=null;Fu.length=0}var Tl=T.ReactCurrentDispatcher,ku=T.ReactCurrentBatchConfig,ss=0,Gt=null,tn=null,an=null,Al=!1,la=!1,ca=0,mx=0;function Mn(){throw Error(t(321))}function zu(n,s){if(s===null)return!1;for(var l=0;l<s.length&&l<n.length;l++)if(!Si(n[l],s[l]))return!1;return!0}function Bu(n,s,l,h,p,x){if(ss=x,Gt=s,s.memoizedState=null,s.updateQueue=null,s.lanes=0,Tl.current=n===null||n.memoizedState===null?xx:yx,n=l(h,p),la){x=0;do{if(la=!1,ca=0,25<=x)throw Error(t(301));x+=1,an=tn=null,s.updateQueue=null,Tl.current=Sx,n=l(h,p)}while(la)}if(Tl.current=Pl,s=tn!==null&&tn.next!==null,ss=0,an=tn=Gt=null,Al=!1,s)throw Error(t(300));return n}function Hu(){var n=ca!==0;return ca=0,n}function Oi(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return an===null?Gt.memoizedState=an=n:an=an.next=n,an}function ui(){if(tn===null){var n=Gt.alternate;n=n!==null?n.memoizedState:null}else n=tn.next;var s=an===null?Gt.memoizedState:an.next;if(s!==null)an=s,tn=n;else{if(n===null)throw Error(t(310));tn=n,n={memoizedState:tn.memoizedState,baseState:tn.baseState,baseQueue:tn.baseQueue,queue:tn.queue,next:null},an===null?Gt.memoizedState=an=n:an=an.next=n}return an}function ua(n,s){return typeof s=="function"?s(n):s}function Vu(n){var s=ui(),l=s.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var h=tn,p=h.baseQueue,x=l.pending;if(x!==null){if(p!==null){var E=p.next;p.next=x.next,x.next=E}h.baseQueue=p=x,l.pending=null}if(p!==null){x=p.next,h=h.baseState;var U=E=null,H=null,te=x;do{var Se=te.lane;if((ss&Se)===Se)H!==null&&(H=H.next={lane:0,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null}),h=te.hasEagerState?te.eagerState:n(h,te.action);else{var Me={lane:Se,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null};H===null?(U=H=Me,E=h):H=H.next=Me,Gt.lanes|=Se,os|=Se}te=te.next}while(te!==null&&te!==x);H===null?E=h:H.next=U,Si(h,s.memoizedState)||(Wn=!0),s.memoizedState=h,s.baseState=E,s.baseQueue=H,l.lastRenderedState=h}if(n=l.interleaved,n!==null){p=n;do x=p.lane,Gt.lanes|=x,os|=x,p=p.next;while(p!==n)}else p===null&&(l.lanes=0);return[s.memoizedState,l.dispatch]}function Gu(n){var s=ui(),l=s.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var h=l.dispatch,p=l.pending,x=s.memoizedState;if(p!==null){l.pending=null;var E=p=p.next;do x=n(x,E.action),E=E.next;while(E!==p);Si(x,s.memoizedState)||(Wn=!0),s.memoizedState=x,s.baseQueue===null&&(s.baseState=x),l.lastRenderedState=x}return[x,h]}function Xp(){}function jp(n,s){var l=Gt,h=ui(),p=s(),x=!Si(h.memoizedState,p);if(x&&(h.memoizedState=p,Wn=!0),h=h.queue,Wu(Kp.bind(null,l,h,n),[n]),h.getSnapshot!==s||x||an!==null&&an.memoizedState.tag&1){if(l.flags|=2048,ha(9,qp.bind(null,l,h,p,s),void 0,null),ln===null)throw Error(t(349));(ss&30)!==0||Yp(l,s,p)}return p}function Yp(n,s,l){n.flags|=16384,n={getSnapshot:s,value:l},s=Gt.updateQueue,s===null?(s={lastEffect:null,stores:null},Gt.updateQueue=s,s.stores=[n]):(l=s.stores,l===null?s.stores=[n]:l.push(n))}function qp(n,s,l,h){s.value=l,s.getSnapshot=h,$p(s)&&Zp(n)}function Kp(n,s,l){return l(function(){$p(s)&&Zp(n)})}function $p(n){var s=n.getSnapshot;n=n.value;try{var l=s();return!Si(n,l)}catch{return!0}}function Zp(n){var s=tr(n,1);s!==null&&Ai(s,n,1,-1)}function Qp(n){var s=Oi();return typeof n=="function"&&(n=n()),s.memoizedState=s.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:ua,lastRenderedState:n},s.queue=n,n=n.dispatch=_x.bind(null,Gt,n),[s.memoizedState,n]}function ha(n,s,l,h){return n={tag:n,create:s,destroy:l,deps:h,next:null},s=Gt.updateQueue,s===null?(s={lastEffect:null,stores:null},Gt.updateQueue=s,s.lastEffect=n.next=n):(l=s.lastEffect,l===null?s.lastEffect=n.next=n:(h=l.next,l.next=n,n.next=h,s.lastEffect=n)),n}function Jp(){return ui().memoizedState}function Cl(n,s,l,h){var p=Oi();Gt.flags|=n,p.memoizedState=ha(1|s,l,void 0,h===void 0?null:h)}function Rl(n,s,l,h){var p=ui();h=h===void 0?null:h;var x=void 0;if(tn!==null){var E=tn.memoizedState;if(x=E.destroy,h!==null&&zu(h,E.deps)){p.memoizedState=ha(s,l,x,h);return}}Gt.flags|=n,p.memoizedState=ha(1|s,l,x,h)}function em(n,s){return Cl(8390656,8,n,s)}function Wu(n,s){return Rl(2048,8,n,s)}function tm(n,s){return Rl(4,2,n,s)}function nm(n,s){return Rl(4,4,n,s)}function im(n,s){if(typeof s=="function")return n=n(),s(n),function(){s(null)};if(s!=null)return n=n(),s.current=n,function(){s.current=null}}function rm(n,s,l){return l=l!=null?l.concat([n]):null,Rl(4,4,im.bind(null,s,n),l)}function Xu(){}function sm(n,s){var l=ui();s=s===void 0?null:s;var h=l.memoizedState;return h!==null&&s!==null&&zu(s,h[1])?h[0]:(l.memoizedState=[n,s],n)}function om(n,s){var l=ui();s=s===void 0?null:s;var h=l.memoizedState;return h!==null&&s!==null&&zu(s,h[1])?h[0]:(n=n(),l.memoizedState=[n,s],n)}function am(n,s,l){return(ss&21)===0?(n.baseState&&(n.baseState=!1,Wn=!0),n.memoizedState=l):(Si(l,s)||(l=Ln(),Gt.lanes|=l,os|=l,n.baseState=!0),s)}function gx(n,s){var l=Dt;Dt=l!==0&&4>l?l:4,n(!0);var h=ku.transition;ku.transition={};try{n(!1),s()}finally{Dt=l,ku.transition=h}}function lm(){return ui().memoizedState}function vx(n,s,l){var h=Ur(n);if(l={lane:h,action:l,hasEagerState:!1,eagerState:null,next:null},cm(n))um(s,l);else if(l=Bp(n,s,l,h),l!==null){var p=In();Ai(l,n,h,p),hm(l,s,h)}}function _x(n,s,l){var h=Ur(n),p={lane:h,action:l,hasEagerState:!1,eagerState:null,next:null};if(cm(n))um(s,p);else{var x=n.alternate;if(n.lanes===0&&(x===null||x.lanes===0)&&(x=s.lastRenderedReducer,x!==null))try{var E=s.lastRenderedState,U=x(E,l);if(p.hasEagerState=!0,p.eagerState=U,Si(U,E)){var H=s.interleaved;H===null?(p.next=p,Du(s)):(p.next=H.next,H.next=p),s.interleaved=p;return}}catch{}finally{}l=Bp(n,s,p,h),l!==null&&(p=In(),Ai(l,n,h,p),hm(l,s,h))}}function cm(n){var s=n.alternate;return n===Gt||s!==null&&s===Gt}function um(n,s){la=Al=!0;var l=n.pending;l===null?s.next=s:(s.next=l.next,l.next=s),n.pending=s}function hm(n,s,l){if((l&4194240)!==0){var h=s.lanes;h&=n.pendingLanes,l|=h,s.lanes=l,Yc(n,l)}}var Pl={readContext:ci,useCallback:Mn,useContext:Mn,useEffect:Mn,useImperativeHandle:Mn,useInsertionEffect:Mn,useLayoutEffect:Mn,useMemo:Mn,useReducer:Mn,useRef:Mn,useState:Mn,useDebugValue:Mn,useDeferredValue:Mn,useTransition:Mn,useMutableSource:Mn,useSyncExternalStore:Mn,useId:Mn,unstable_isNewReconciler:!1},xx={readContext:ci,useCallback:function(n,s){return Oi().memoizedState=[n,s===void 0?null:s],n},useContext:ci,useEffect:em,useImperativeHandle:function(n,s,l){return l=l!=null?l.concat([n]):null,Cl(4194308,4,im.bind(null,s,n),l)},useLayoutEffect:function(n,s){return Cl(4194308,4,n,s)},useInsertionEffect:function(n,s){return Cl(4,2,n,s)},useMemo:function(n,s){var l=Oi();return s=s===void 0?null:s,n=n(),l.memoizedState=[n,s],n},useReducer:function(n,s,l){var h=Oi();return s=l!==void 0?l(s):s,h.memoizedState=h.baseState=s,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:s},h.queue=n,n=n.dispatch=vx.bind(null,Gt,n),[h.memoizedState,n]},useRef:function(n){var s=Oi();return n={current:n},s.memoizedState=n},useState:Qp,useDebugValue:Xu,useDeferredValue:function(n){return Oi().memoizedState=n},useTransition:function(){var n=Qp(!1),s=n[0];return n=gx.bind(null,n[1]),Oi().memoizedState=n,[s,n]},useMutableSource:function(){},useSyncExternalStore:function(n,s,l){var h=Gt,p=Oi();if(Bt){if(l===void 0)throw Error(t(407));l=l()}else{if(l=s(),ln===null)throw Error(t(349));(ss&30)!==0||Yp(h,s,l)}p.memoizedState=l;var x={value:l,getSnapshot:s};return p.queue=x,em(Kp.bind(null,h,x,n),[n]),h.flags|=2048,ha(9,qp.bind(null,h,x,l,s),void 0,null),l},useId:function(){var n=Oi(),s=ln.identifierPrefix;if(Bt){var l=er,h=Ji;l=(h&~(1<<32-mt(h)-1)).toString(32)+l,s=":"+s+"R"+l,l=ca++,0<l&&(s+="H"+l.toString(32)),s+=":"}else l=mx++,s=":"+s+"r"+l.toString(32)+":";return n.memoizedState=s},unstable_isNewReconciler:!1},yx={readContext:ci,useCallback:sm,useContext:ci,useEffect:Wu,useImperativeHandle:rm,useInsertionEffect:tm,useLayoutEffect:nm,useMemo:om,useReducer:Vu,useRef:Jp,useState:function(){return Vu(ua)},useDebugValue:Xu,useDeferredValue:function(n){var s=ui();return am(s,tn.memoizedState,n)},useTransition:function(){var n=Vu(ua)[0],s=ui().memoizedState;return[n,s]},useMutableSource:Xp,useSyncExternalStore:jp,useId:lm,unstable_isNewReconciler:!1},Sx={readContext:ci,useCallback:sm,useContext:ci,useEffect:Wu,useImperativeHandle:rm,useInsertionEffect:tm,useLayoutEffect:nm,useMemo:om,useReducer:Gu,useRef:Jp,useState:function(){return Gu(ua)},useDebugValue:Xu,useDeferredValue:function(n){var s=ui();return tn===null?s.memoizedState=n:am(s,tn.memoizedState,n)},useTransition:function(){var n=Gu(ua)[0],s=ui().memoizedState;return[n,s]},useMutableSource:Xp,useSyncExternalStore:jp,useId:lm,unstable_isNewReconciler:!1};function wi(n,s){if(n&&n.defaultProps){s=ae({},s),n=n.defaultProps;for(var l in n)s[l]===void 0&&(s[l]=n[l]);return s}return s}function ju(n,s,l,h){s=n.memoizedState,l=l(h,s),l=l==null?s:ae({},s,l),n.memoizedState=l,n.lanes===0&&(n.updateQueue.baseState=l)}var bl={isMounted:function(n){return(n=n._reactInternals)?Ii(n)===n:!1},enqueueSetState:function(n,s,l){n=n._reactInternals;var h=In(),p=Ur(n),x=nr(h,p);x.payload=s,l!=null&&(x.callback=l),s=Lr(n,x,p),s!==null&&(Ai(s,n,p,h),Ml(s,n,p))},enqueueReplaceState:function(n,s,l){n=n._reactInternals;var h=In(),p=Ur(n),x=nr(h,p);x.tag=1,x.payload=s,l!=null&&(x.callback=l),s=Lr(n,x,p),s!==null&&(Ai(s,n,p,h),Ml(s,n,p))},enqueueForceUpdate:function(n,s){n=n._reactInternals;var l=In(),h=Ur(n),p=nr(l,h);p.tag=2,s!=null&&(p.callback=s),s=Lr(n,p,h),s!==null&&(Ai(s,n,h,l),Ml(s,n,h))}};function fm(n,s,l,h,p,x,E){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(h,x,E):s.prototype&&s.prototype.isPureReactComponent?!Zo(l,h)||!Zo(p,x):!0}function dm(n,s,l){var h=!1,p=Rr,x=s.contextType;return typeof x=="object"&&x!==null?x=ci(x):(p=Gn(s)?es:Sn.current,h=s.contextTypes,x=(h=h!=null)?Bs(n,p):Rr),s=new s(l,x),n.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=bl,n.stateNode=s,s._reactInternals=n,h&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=p,n.__reactInternalMemoizedMaskedChildContext=x),s}function pm(n,s,l,h){n=s.state,typeof s.componentWillReceiveProps=="function"&&s.componentWillReceiveProps(l,h),typeof s.UNSAFE_componentWillReceiveProps=="function"&&s.UNSAFE_componentWillReceiveProps(l,h),s.state!==n&&bl.enqueueReplaceState(s,s.state,null)}function Yu(n,s,l,h){var p=n.stateNode;p.props=l,p.state=n.memoizedState,p.refs={},Iu(n);var x=s.contextType;typeof x=="object"&&x!==null?p.context=ci(x):(x=Gn(s)?es:Sn.current,p.context=Bs(n,x)),p.state=n.memoizedState,x=s.getDerivedStateFromProps,typeof x=="function"&&(ju(n,s,x,l),p.state=n.memoizedState),typeof s.getDerivedStateFromProps=="function"||typeof p.getSnapshotBeforeUpdate=="function"||typeof p.UNSAFE_componentWillMount!="function"&&typeof p.componentWillMount!="function"||(s=p.state,typeof p.componentWillMount=="function"&&p.componentWillMount(),typeof p.UNSAFE_componentWillMount=="function"&&p.UNSAFE_componentWillMount(),s!==p.state&&bl.enqueueReplaceState(p,p.state,null),wl(n,l,p,h),p.state=n.memoizedState),typeof p.componentDidMount=="function"&&(n.flags|=4194308)}function qs(n,s){try{var l="",h=s;do l+=fe(h),h=h.return;while(h);var p=l}catch(x){p=`
Error generating stack: `+x.message+`
`+x.stack}return{value:n,source:s,stack:p,digest:null}}function qu(n,s,l){return{value:n,source:null,stack:l??null,digest:s??null}}function Ku(n,s){try{console.error(s.value)}catch(l){setTimeout(function(){throw l})}}var Mx=typeof WeakMap=="function"?WeakMap:Map;function mm(n,s,l){l=nr(-1,l),l.tag=3,l.payload={element:null};var h=s.value;return l.callback=function(){Ol||(Ol=!0,uh=h),Ku(n,s)},l}function gm(n,s,l){l=nr(-1,l),l.tag=3;var h=n.type.getDerivedStateFromError;if(typeof h=="function"){var p=s.value;l.payload=function(){return h(p)},l.callback=function(){Ku(n,s)}}var x=n.stateNode;return x!==null&&typeof x.componentDidCatch=="function"&&(l.callback=function(){Ku(n,s),typeof h!="function"&&(Ir===null?Ir=new Set([this]):Ir.add(this));var E=s.stack;this.componentDidCatch(s.value,{componentStack:E!==null?E:""})}),l}function vm(n,s,l){var h=n.pingCache;if(h===null){h=n.pingCache=new Mx;var p=new Set;h.set(s,p)}else p=h.get(s),p===void 0&&(p=new Set,h.set(s,p));p.has(l)||(p.add(l),n=Fx.bind(null,n,s,l),s.then(n,n))}function _m(n){do{var s;if((s=n.tag===13)&&(s=n.memoizedState,s=s!==null?s.dehydrated!==null:!0),s)return n;n=n.return}while(n!==null);return null}function xm(n,s,l,h,p){return(n.mode&1)===0?(n===s?n.flags|=65536:(n.flags|=128,l.flags|=131072,l.flags&=-52805,l.tag===1&&(l.alternate===null?l.tag=17:(s=nr(-1,1),s.tag=2,Lr(l,s,1))),l.lanes|=1),n):(n.flags|=65536,n.lanes=p,n)}var wx=T.ReactCurrentOwner,Wn=!1;function Dn(n,s,l,h){s.child=n===null?zp(s,null,l,h):Ws(s,n.child,l,h)}function ym(n,s,l,h,p){l=l.render;var x=s.ref;return js(s,p),h=Bu(n,s,l,h,x,p),l=Hu(),n!==null&&!Wn?(s.updateQueue=n.updateQueue,s.flags&=-2053,n.lanes&=~p,ir(n,s,p)):(Bt&&l&&wu(s),s.flags|=1,Dn(n,s,h,p),s.child)}function Sm(n,s,l,h,p){if(n===null){var x=l.type;return typeof x=="function"&&!vh(x)&&x.defaultProps===void 0&&l.compare===null&&l.defaultProps===void 0?(s.tag=15,s.type=x,Mm(n,s,x,h,p)):(n=Gl(l.type,null,h,s,s.mode,p),n.ref=s.ref,n.return=s,s.child=n)}if(x=n.child,(n.lanes&p)===0){var E=x.memoizedProps;if(l=l.compare,l=l!==null?l:Zo,l(E,h)&&n.ref===s.ref)return ir(n,s,p)}return s.flags|=1,n=Or(x,h),n.ref=s.ref,n.return=s,s.child=n}function Mm(n,s,l,h,p){if(n!==null){var x=n.memoizedProps;if(Zo(x,h)&&n.ref===s.ref)if(Wn=!1,s.pendingProps=h=x,(n.lanes&p)!==0)(n.flags&131072)!==0&&(Wn=!0);else return s.lanes=n.lanes,ir(n,s,p)}return $u(n,s,l,h,p)}function wm(n,s,l){var h=s.pendingProps,p=h.children,x=n!==null?n.memoizedState:null;if(h.mode==="hidden")if((s.mode&1)===0)s.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ft($s,ei),ei|=l;else{if((l&1073741824)===0)return n=x!==null?x.baseLanes|l:l,s.lanes=s.childLanes=1073741824,s.memoizedState={baseLanes:n,cachePool:null,transitions:null},s.updateQueue=null,Ft($s,ei),ei|=n,null;s.memoizedState={baseLanes:0,cachePool:null,transitions:null},h=x!==null?x.baseLanes:l,Ft($s,ei),ei|=h}else x!==null?(h=x.baseLanes|l,s.memoizedState=null):h=l,Ft($s,ei),ei|=h;return Dn(n,s,p,l),s.child}function Em(n,s){var l=s.ref;(n===null&&l!==null||n!==null&&n.ref!==l)&&(s.flags|=512,s.flags|=2097152)}function $u(n,s,l,h,p){var x=Gn(l)?es:Sn.current;return x=Bs(s,x),js(s,p),l=Bu(n,s,l,h,x,p),h=Hu(),n!==null&&!Wn?(s.updateQueue=n.updateQueue,s.flags&=-2053,n.lanes&=~p,ir(n,s,p)):(Bt&&h&&wu(s),s.flags|=1,Dn(n,s,l,p),s.child)}function Tm(n,s,l,h,p){if(Gn(l)){var x=!0;pl(s)}else x=!1;if(js(s,p),s.stateNode===null)Dl(n,s),dm(s,l,h),Yu(s,l,h,p),h=!0;else if(n===null){var E=s.stateNode,U=s.memoizedProps;E.props=U;var H=E.context,te=l.contextType;typeof te=="object"&&te!==null?te=ci(te):(te=Gn(l)?es:Sn.current,te=Bs(s,te));var Se=l.getDerivedStateFromProps,Me=typeof Se=="function"||typeof E.getSnapshotBeforeUpdate=="function";Me||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(U!==h||H!==te)&&pm(s,E,h,te),br=!1;var ye=s.memoizedState;E.state=ye,wl(s,h,E,p),H=s.memoizedState,U!==h||ye!==H||Vn.current||br?(typeof Se=="function"&&(ju(s,l,Se,h),H=s.memoizedState),(U=br||fm(s,l,U,h,ye,H,te))?(Me||typeof E.UNSAFE_componentWillMount!="function"&&typeof E.componentWillMount!="function"||(typeof E.componentWillMount=="function"&&E.componentWillMount(),typeof E.UNSAFE_componentWillMount=="function"&&E.UNSAFE_componentWillMount()),typeof E.componentDidMount=="function"&&(s.flags|=4194308)):(typeof E.componentDidMount=="function"&&(s.flags|=4194308),s.memoizedProps=h,s.memoizedState=H),E.props=h,E.state=H,E.context=te,h=U):(typeof E.componentDidMount=="function"&&(s.flags|=4194308),h=!1)}else{E=s.stateNode,Hp(n,s),U=s.memoizedProps,te=s.type===s.elementType?U:wi(s.type,U),E.props=te,Me=s.pendingProps,ye=E.context,H=l.contextType,typeof H=="object"&&H!==null?H=ci(H):(H=Gn(l)?es:Sn.current,H=Bs(s,H));var He=l.getDerivedStateFromProps;(Se=typeof He=="function"||typeof E.getSnapshotBeforeUpdate=="function")||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(U!==Me||ye!==H)&&pm(s,E,h,H),br=!1,ye=s.memoizedState,E.state=ye,wl(s,h,E,p);var Ye=s.memoizedState;U!==Me||ye!==Ye||Vn.current||br?(typeof He=="function"&&(ju(s,l,He,h),Ye=s.memoizedState),(te=br||fm(s,l,te,h,ye,Ye,H)||!1)?(Se||typeof E.UNSAFE_componentWillUpdate!="function"&&typeof E.componentWillUpdate!="function"||(typeof E.componentWillUpdate=="function"&&E.componentWillUpdate(h,Ye,H),typeof E.UNSAFE_componentWillUpdate=="function"&&E.UNSAFE_componentWillUpdate(h,Ye,H)),typeof E.componentDidUpdate=="function"&&(s.flags|=4),typeof E.getSnapshotBeforeUpdate=="function"&&(s.flags|=1024)):(typeof E.componentDidUpdate!="function"||U===n.memoizedProps&&ye===n.memoizedState||(s.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ye===n.memoizedState||(s.flags|=1024),s.memoizedProps=h,s.memoizedState=Ye),E.props=h,E.state=Ye,E.context=H,h=te):(typeof E.componentDidUpdate!="function"||U===n.memoizedProps&&ye===n.memoizedState||(s.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ye===n.memoizedState||(s.flags|=1024),h=!1)}return Zu(n,s,l,h,x,p)}function Zu(n,s,l,h,p,x){Em(n,s);var E=(s.flags&128)!==0;if(!h&&!E)return p&&bp(s,l,!1),ir(n,s,x);h=s.stateNode,wx.current=s;var U=E&&typeof l.getDerivedStateFromError!="function"?null:h.render();return s.flags|=1,n!==null&&E?(s.child=Ws(s,n.child,null,x),s.child=Ws(s,null,U,x)):Dn(n,s,U,x),s.memoizedState=h.state,p&&bp(s,l,!0),s.child}function Am(n){var s=n.stateNode;s.pendingContext?Rp(n,s.pendingContext,s.pendingContext!==s.context):s.context&&Rp(n,s.context,!1),Nu(n,s.containerInfo)}function Cm(n,s,l,h,p){return Gs(),Cu(p),s.flags|=256,Dn(n,s,l,h),s.child}var Qu={dehydrated:null,treeContext:null,retryLane:0};function Ju(n){return{baseLanes:n,cachePool:null,transitions:null}}function Rm(n,s,l){var h=s.pendingProps,p=Vt.current,x=!1,E=(s.flags&128)!==0,U;if((U=E)||(U=n!==null&&n.memoizedState===null?!1:(p&2)!==0),U?(x=!0,s.flags&=-129):(n===null||n.memoizedState!==null)&&(p|=1),Ft(Vt,p&1),n===null)return Au(s),n=s.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((s.mode&1)===0?s.lanes=1:n.data==="$!"?s.lanes=8:s.lanes=1073741824,null):(E=h.children,n=h.fallback,x?(h=s.mode,x=s.child,E={mode:"hidden",children:E},(h&1)===0&&x!==null?(x.childLanes=0,x.pendingProps=E):x=Wl(E,h,0,null),n=us(n,h,l,null),x.return=s,n.return=s,x.sibling=n,s.child=x,s.child.memoizedState=Ju(l),s.memoizedState=Qu,n):eh(s,E));if(p=n.memoizedState,p!==null&&(U=p.dehydrated,U!==null))return Ex(n,s,E,h,U,p,l);if(x){x=h.fallback,E=s.mode,p=n.child,U=p.sibling;var H={mode:"hidden",children:h.children};return(E&1)===0&&s.child!==p?(h=s.child,h.childLanes=0,h.pendingProps=H,s.deletions=null):(h=Or(p,H),h.subtreeFlags=p.subtreeFlags&14680064),U!==null?x=Or(U,x):(x=us(x,E,l,null),x.flags|=2),x.return=s,h.return=s,h.sibling=x,s.child=h,h=x,x=s.child,E=n.child.memoizedState,E=E===null?Ju(l):{baseLanes:E.baseLanes|l,cachePool:null,transitions:E.transitions},x.memoizedState=E,x.childLanes=n.childLanes&~l,s.memoizedState=Qu,h}return x=n.child,n=x.sibling,h=Or(x,{mode:"visible",children:h.children}),(s.mode&1)===0&&(h.lanes=l),h.return=s,h.sibling=null,n!==null&&(l=s.deletions,l===null?(s.deletions=[n],s.flags|=16):l.push(n)),s.child=h,s.memoizedState=null,h}function eh(n,s){return s=Wl({mode:"visible",children:s},n.mode,0,null),s.return=n,n.child=s}function Ll(n,s,l,h){return h!==null&&Cu(h),Ws(s,n.child,null,l),n=eh(s,s.pendingProps.children),n.flags|=2,s.memoizedState=null,n}function Ex(n,s,l,h,p,x,E){if(l)return s.flags&256?(s.flags&=-257,h=qu(Error(t(422))),Ll(n,s,E,h)):s.memoizedState!==null?(s.child=n.child,s.flags|=128,null):(x=h.fallback,p=s.mode,h=Wl({mode:"visible",children:h.children},p,0,null),x=us(x,p,E,null),x.flags|=2,h.return=s,x.return=s,h.sibling=x,s.child=h,(s.mode&1)!==0&&Ws(s,n.child,null,E),s.child.memoizedState=Ju(E),s.memoizedState=Qu,x);if((s.mode&1)===0)return Ll(n,s,E,null);if(p.data==="$!"){if(h=p.nextSibling&&p.nextSibling.dataset,h)var U=h.dgst;return h=U,x=Error(t(419)),h=qu(x,h,void 0),Ll(n,s,E,h)}if(U=(E&n.childLanes)!==0,Wn||U){if(h=ln,h!==null){switch(E&-E){case 4:p=2;break;case 16:p=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:p=32;break;case 536870912:p=268435456;break;default:p=0}p=(p&(h.suspendedLanes|E))!==0?0:p,p!==0&&p!==x.retryLane&&(x.retryLane=p,tr(n,p),Ai(h,n,p,-1))}return gh(),h=qu(Error(t(421))),Ll(n,s,E,h)}return p.data==="$?"?(s.flags|=128,s.child=n.child,s=Ox.bind(null,n),p._reactRetry=s,null):(n=x.treeContext,Jn=Ar(p.nextSibling),Qn=s,Bt=!0,Mi=null,n!==null&&(ai[li++]=Ji,ai[li++]=er,ai[li++]=ts,Ji=n.id,er=n.overflow,ts=s),s=eh(s,h.children),s.flags|=4096,s)}function Pm(n,s,l){n.lanes|=s;var h=n.alternate;h!==null&&(h.lanes|=s),Lu(n.return,s,l)}function th(n,s,l,h,p){var x=n.memoizedState;x===null?n.memoizedState={isBackwards:s,rendering:null,renderingStartTime:0,last:h,tail:l,tailMode:p}:(x.isBackwards=s,x.rendering=null,x.renderingStartTime=0,x.last=h,x.tail=l,x.tailMode=p)}function bm(n,s,l){var h=s.pendingProps,p=h.revealOrder,x=h.tail;if(Dn(n,s,h.children,l),h=Vt.current,(h&2)!==0)h=h&1|2,s.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=s.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Pm(n,l,s);else if(n.tag===19)Pm(n,l,s);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===s)break e;for(;n.sibling===null;){if(n.return===null||n.return===s)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}h&=1}if(Ft(Vt,h),(s.mode&1)===0)s.memoizedState=null;else switch(p){case"forwards":for(l=s.child,p=null;l!==null;)n=l.alternate,n!==null&&El(n)===null&&(p=l),l=l.sibling;l=p,l===null?(p=s.child,s.child=null):(p=l.sibling,l.sibling=null),th(s,!1,p,l,x);break;case"backwards":for(l=null,p=s.child,s.child=null;p!==null;){if(n=p.alternate,n!==null&&El(n)===null){s.child=p;break}n=p.sibling,p.sibling=l,l=p,p=n}th(s,!0,l,null,x);break;case"together":th(s,!1,null,null,void 0);break;default:s.memoizedState=null}return s.child}function Dl(n,s){(s.mode&1)===0&&n!==null&&(n.alternate=null,s.alternate=null,s.flags|=2)}function ir(n,s,l){if(n!==null&&(s.dependencies=n.dependencies),os|=s.lanes,(l&s.childLanes)===0)return null;if(n!==null&&s.child!==n.child)throw Error(t(153));if(s.child!==null){for(n=s.child,l=Or(n,n.pendingProps),s.child=l,l.return=s;n.sibling!==null;)n=n.sibling,l=l.sibling=Or(n,n.pendingProps),l.return=s;l.sibling=null}return s.child}function Tx(n,s,l){switch(s.tag){case 3:Am(s),Gs();break;case 5:Wp(s);break;case 1:Gn(s.type)&&pl(s);break;case 4:Nu(s,s.stateNode.containerInfo);break;case 10:var h=s.type._context,p=s.memoizedProps.value;Ft(yl,h._currentValue),h._currentValue=p;break;case 13:if(h=s.memoizedState,h!==null)return h.dehydrated!==null?(Ft(Vt,Vt.current&1),s.flags|=128,null):(l&s.child.childLanes)!==0?Rm(n,s,l):(Ft(Vt,Vt.current&1),n=ir(n,s,l),n!==null?n.sibling:null);Ft(Vt,Vt.current&1);break;case 19:if(h=(l&s.childLanes)!==0,(n.flags&128)!==0){if(h)return bm(n,s,l);s.flags|=128}if(p=s.memoizedState,p!==null&&(p.rendering=null,p.tail=null,p.lastEffect=null),Ft(Vt,Vt.current),h)break;return null;case 22:case 23:return s.lanes=0,wm(n,s,l)}return ir(n,s,l)}var Lm,nh,Dm,Im;Lm=function(n,s){for(var l=s.child;l!==null;){if(l.tag===5||l.tag===6)n.appendChild(l.stateNode);else if(l.tag!==4&&l.child!==null){l.child.return=l,l=l.child;continue}if(l===s)break;for(;l.sibling===null;){if(l.return===null||l.return===s)return;l=l.return}l.sibling.return=l.return,l=l.sibling}},nh=function(){},Dm=function(n,s,l,h){var p=n.memoizedProps;if(p!==h){n=s.stateNode,rs(Fi.current);var x=null;switch(l){case"input":p=O(n,p),h=O(n,h),x=[];break;case"select":p=ae({},p,{value:void 0}),h=ae({},h,{value:void 0}),x=[];break;case"textarea":p=C(n,p),h=C(n,h),x=[];break;default:typeof p.onClick!="function"&&typeof h.onClick=="function"&&(n.onclick=hl)}xt(l,h);var E;l=null;for(te in p)if(!h.hasOwnProperty(te)&&p.hasOwnProperty(te)&&p[te]!=null)if(te==="style"){var U=p[te];for(E in U)U.hasOwnProperty(E)&&(l||(l={}),l[E]="")}else te!=="dangerouslySetInnerHTML"&&te!=="children"&&te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&te!=="autoFocus"&&(o.hasOwnProperty(te)?x||(x=[]):(x=x||[]).push(te,null));for(te in h){var H=h[te];if(U=p!=null?p[te]:void 0,h.hasOwnProperty(te)&&H!==U&&(H!=null||U!=null))if(te==="style")if(U){for(E in U)!U.hasOwnProperty(E)||H&&H.hasOwnProperty(E)||(l||(l={}),l[E]="");for(E in H)H.hasOwnProperty(E)&&U[E]!==H[E]&&(l||(l={}),l[E]=H[E])}else l||(x||(x=[]),x.push(te,l)),l=H;else te==="dangerouslySetInnerHTML"?(H=H?H.__html:void 0,U=U?U.__html:void 0,H!=null&&U!==H&&(x=x||[]).push(te,H)):te==="children"?typeof H!="string"&&typeof H!="number"||(x=x||[]).push(te,""+H):te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&(o.hasOwnProperty(te)?(H!=null&&te==="onScroll"&&kt("scroll",n),x||U===H||(x=[])):(x=x||[]).push(te,H))}l&&(x=x||[]).push("style",l);var te=x;(s.updateQueue=te)&&(s.flags|=4)}},Im=function(n,s,l,h){l!==h&&(s.flags|=4)};function fa(n,s){if(!Bt)switch(n.tailMode){case"hidden":s=n.tail;for(var l=null;s!==null;)s.alternate!==null&&(l=s),s=s.sibling;l===null?n.tail=null:l.sibling=null;break;case"collapsed":l=n.tail;for(var h=null;l!==null;)l.alternate!==null&&(h=l),l=l.sibling;h===null?s||n.tail===null?n.tail=null:n.tail.sibling=null:h.sibling=null}}function wn(n){var s=n.alternate!==null&&n.alternate.child===n.child,l=0,h=0;if(s)for(var p=n.child;p!==null;)l|=p.lanes|p.childLanes,h|=p.subtreeFlags&14680064,h|=p.flags&14680064,p.return=n,p=p.sibling;else for(p=n.child;p!==null;)l|=p.lanes|p.childLanes,h|=p.subtreeFlags,h|=p.flags,p.return=n,p=p.sibling;return n.subtreeFlags|=h,n.childLanes=l,s}function Ax(n,s,l){var h=s.pendingProps;switch(Eu(s),s.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return wn(s),null;case 1:return Gn(s.type)&&dl(),wn(s),null;case 3:return h=s.stateNode,Ys(),zt(Vn),zt(Sn),Ou(),h.pendingContext&&(h.context=h.pendingContext,h.pendingContext=null),(n===null||n.child===null)&&(_l(s)?s.flags|=4:n===null||n.memoizedState.isDehydrated&&(s.flags&256)===0||(s.flags|=1024,Mi!==null&&(dh(Mi),Mi=null))),nh(n,s),wn(s),null;case 5:Uu(s);var p=rs(aa.current);if(l=s.type,n!==null&&s.stateNode!=null)Dm(n,s,l,h,p),n.ref!==s.ref&&(s.flags|=512,s.flags|=2097152);else{if(!h){if(s.stateNode===null)throw Error(t(166));return wn(s),null}if(n=rs(Fi.current),_l(s)){h=s.stateNode,l=s.type;var x=s.memoizedProps;switch(h[Ui]=s,h[na]=x,n=(s.mode&1)!==0,l){case"dialog":kt("cancel",h),kt("close",h);break;case"iframe":case"object":case"embed":kt("load",h);break;case"video":case"audio":for(p=0;p<Jo.length;p++)kt(Jo[p],h);break;case"source":kt("error",h);break;case"img":case"image":case"link":kt("error",h),kt("load",h);break;case"details":kt("toggle",h);break;case"input":Qe(h,x),kt("invalid",h);break;case"select":h._wrapperState={wasMultiple:!!x.multiple},kt("invalid",h);break;case"textarea":Z(h,x),kt("invalid",h)}xt(l,x),p=null;for(var E in x)if(x.hasOwnProperty(E)){var U=x[E];E==="children"?typeof U=="string"?h.textContent!==U&&(x.suppressHydrationWarning!==!0&&ul(h.textContent,U,n),p=["children",U]):typeof U=="number"&&h.textContent!==""+U&&(x.suppressHydrationWarning!==!0&&ul(h.textContent,U,n),p=["children",""+U]):o.hasOwnProperty(E)&&U!=null&&E==="onScroll"&&kt("scroll",h)}switch(l){case"input":_t(h),Le(h,x,!0);break;case"textarea":_t(h),xe(h);break;case"select":case"option":break;default:typeof x.onClick=="function"&&(h.onclick=hl)}h=p,s.updateQueue=h,h!==null&&(s.flags|=4)}else{E=p.nodeType===9?p:p.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=pe(l)),n==="http://www.w3.org/1999/xhtml"?l==="script"?(n=E.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof h.is=="string"?n=E.createElement(l,{is:h.is}):(n=E.createElement(l),l==="select"&&(E=n,h.multiple?E.multiple=!0:h.size&&(E.size=h.size))):n=E.createElementNS(n,l),n[Ui]=s,n[na]=h,Lm(n,s,!1,!1),s.stateNode=n;e:{switch(E=ft(l,h),l){case"dialog":kt("cancel",n),kt("close",n),p=h;break;case"iframe":case"object":case"embed":kt("load",n),p=h;break;case"video":case"audio":for(p=0;p<Jo.length;p++)kt(Jo[p],n);p=h;break;case"source":kt("error",n),p=h;break;case"img":case"image":case"link":kt("error",n),kt("load",n),p=h;break;case"details":kt("toggle",n),p=h;break;case"input":Qe(n,h),p=O(n,h),kt("invalid",n);break;case"option":p=h;break;case"select":n._wrapperState={wasMultiple:!!h.multiple},p=ae({},h,{value:void 0}),kt("invalid",n);break;case"textarea":Z(n,h),p=C(n,h),kt("invalid",n);break;default:p=h}xt(l,p),U=p;for(x in U)if(U.hasOwnProperty(x)){var H=U[x];x==="style"?at(n,H):x==="dangerouslySetInnerHTML"?(H=H?H.__html:void 0,H!=null&&Ge(n,H)):x==="children"?typeof H=="string"?(l!=="textarea"||H!=="")&&pt(n,H):typeof H=="number"&&pt(n,""+H):x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&x!=="autoFocus"&&(o.hasOwnProperty(x)?H!=null&&x==="onScroll"&&kt("scroll",n):H!=null&&P(n,x,H,E))}switch(l){case"input":_t(n),Le(n,h,!1);break;case"textarea":_t(n),xe(n);break;case"option":h.value!=null&&n.setAttribute("value",""+Ae(h.value));break;case"select":n.multiple=!!h.multiple,x=h.value,x!=null?D(n,!!h.multiple,x,!1):h.defaultValue!=null&&D(n,!!h.multiple,h.defaultValue,!0);break;default:typeof p.onClick=="function"&&(n.onclick=hl)}switch(l){case"button":case"input":case"select":case"textarea":h=!!h.autoFocus;break e;case"img":h=!0;break e;default:h=!1}}h&&(s.flags|=4)}s.ref!==null&&(s.flags|=512,s.flags|=2097152)}return wn(s),null;case 6:if(n&&s.stateNode!=null)Im(n,s,n.memoizedProps,h);else{if(typeof h!="string"&&s.stateNode===null)throw Error(t(166));if(l=rs(aa.current),rs(Fi.current),_l(s)){if(h=s.stateNode,l=s.memoizedProps,h[Ui]=s,(x=h.nodeValue!==l)&&(n=Qn,n!==null))switch(n.tag){case 3:ul(h.nodeValue,l,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&ul(h.nodeValue,l,(n.mode&1)!==0)}x&&(s.flags|=4)}else h=(l.nodeType===9?l:l.ownerDocument).createTextNode(h),h[Ui]=s,s.stateNode=h}return wn(s),null;case 13:if(zt(Vt),h=s.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Bt&&Jn!==null&&(s.mode&1)!==0&&(s.flags&128)===0)Fp(),Gs(),s.flags|=98560,x=!1;else if(x=_l(s),h!==null&&h.dehydrated!==null){if(n===null){if(!x)throw Error(t(318));if(x=s.memoizedState,x=x!==null?x.dehydrated:null,!x)throw Error(t(317));x[Ui]=s}else Gs(),(s.flags&128)===0&&(s.memoizedState=null),s.flags|=4;wn(s),x=!1}else Mi!==null&&(dh(Mi),Mi=null),x=!0;if(!x)return s.flags&65536?s:null}return(s.flags&128)!==0?(s.lanes=l,s):(h=h!==null,h!==(n!==null&&n.memoizedState!==null)&&h&&(s.child.flags|=8192,(s.mode&1)!==0&&(n===null||(Vt.current&1)!==0?nn===0&&(nn=3):gh())),s.updateQueue!==null&&(s.flags|=4),wn(s),null);case 4:return Ys(),nh(n,s),n===null&&ea(s.stateNode.containerInfo),wn(s),null;case 10:return bu(s.type._context),wn(s),null;case 17:return Gn(s.type)&&dl(),wn(s),null;case 19:if(zt(Vt),x=s.memoizedState,x===null)return wn(s),null;if(h=(s.flags&128)!==0,E=x.rendering,E===null)if(h)fa(x,!1);else{if(nn!==0||n!==null&&(n.flags&128)!==0)for(n=s.child;n!==null;){if(E=El(n),E!==null){for(s.flags|=128,fa(x,!1),h=E.updateQueue,h!==null&&(s.updateQueue=h,s.flags|=4),s.subtreeFlags=0,h=l,l=s.child;l!==null;)x=l,n=h,x.flags&=14680066,E=x.alternate,E===null?(x.childLanes=0,x.lanes=n,x.child=null,x.subtreeFlags=0,x.memoizedProps=null,x.memoizedState=null,x.updateQueue=null,x.dependencies=null,x.stateNode=null):(x.childLanes=E.childLanes,x.lanes=E.lanes,x.child=E.child,x.subtreeFlags=0,x.deletions=null,x.memoizedProps=E.memoizedProps,x.memoizedState=E.memoizedState,x.updateQueue=E.updateQueue,x.type=E.type,n=E.dependencies,x.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),l=l.sibling;return Ft(Vt,Vt.current&1|2),s.child}n=n.sibling}x.tail!==null&&Ce()>Zs&&(s.flags|=128,h=!0,fa(x,!1),s.lanes=4194304)}else{if(!h)if(n=El(E),n!==null){if(s.flags|=128,h=!0,l=n.updateQueue,l!==null&&(s.updateQueue=l,s.flags|=4),fa(x,!0),x.tail===null&&x.tailMode==="hidden"&&!E.alternate&&!Bt)return wn(s),null}else 2*Ce()-x.renderingStartTime>Zs&&l!==1073741824&&(s.flags|=128,h=!0,fa(x,!1),s.lanes=4194304);x.isBackwards?(E.sibling=s.child,s.child=E):(l=x.last,l!==null?l.sibling=E:s.child=E,x.last=E)}return x.tail!==null?(s=x.tail,x.rendering=s,x.tail=s.sibling,x.renderingStartTime=Ce(),s.sibling=null,l=Vt.current,Ft(Vt,h?l&1|2:l&1),s):(wn(s),null);case 22:case 23:return mh(),h=s.memoizedState!==null,n!==null&&n.memoizedState!==null!==h&&(s.flags|=8192),h&&(s.mode&1)!==0?(ei&1073741824)!==0&&(wn(s),s.subtreeFlags&6&&(s.flags|=8192)):wn(s),null;case 24:return null;case 25:return null}throw Error(t(156,s.tag))}function Cx(n,s){switch(Eu(s),s.tag){case 1:return Gn(s.type)&&dl(),n=s.flags,n&65536?(s.flags=n&-65537|128,s):null;case 3:return Ys(),zt(Vn),zt(Sn),Ou(),n=s.flags,(n&65536)!==0&&(n&128)===0?(s.flags=n&-65537|128,s):null;case 5:return Uu(s),null;case 13:if(zt(Vt),n=s.memoizedState,n!==null&&n.dehydrated!==null){if(s.alternate===null)throw Error(t(340));Gs()}return n=s.flags,n&65536?(s.flags=n&-65537|128,s):null;case 19:return zt(Vt),null;case 4:return Ys(),null;case 10:return bu(s.type._context),null;case 22:case 23:return mh(),null;case 24:return null;default:return null}}var Il=!1,En=!1,Rx=typeof WeakSet=="function"?WeakSet:Set,We=null;function Ks(n,s){var l=n.ref;if(l!==null)if(typeof l=="function")try{l(null)}catch(h){Xt(n,s,h)}else l.current=null}function ih(n,s,l){try{l()}catch(h){Xt(n,s,h)}}var Nm=!1;function Px(n,s){if(mu=Ja,n=fp(),au(n)){if("selectionStart"in n)var l={start:n.selectionStart,end:n.selectionEnd};else e:{l=(l=n.ownerDocument)&&l.defaultView||window;var h=l.getSelection&&l.getSelection();if(h&&h.rangeCount!==0){l=h.anchorNode;var p=h.anchorOffset,x=h.focusNode;h=h.focusOffset;try{l.nodeType,x.nodeType}catch{l=null;break e}var E=0,U=-1,H=-1,te=0,Se=0,Me=n,ye=null;t:for(;;){for(var He;Me!==l||p!==0&&Me.nodeType!==3||(U=E+p),Me!==x||h!==0&&Me.nodeType!==3||(H=E+h),Me.nodeType===3&&(E+=Me.nodeValue.length),(He=Me.firstChild)!==null;)ye=Me,Me=He;for(;;){if(Me===n)break t;if(ye===l&&++te===p&&(U=E),ye===x&&++Se===h&&(H=E),(He=Me.nextSibling)!==null)break;Me=ye,ye=Me.parentNode}Me=He}l=U===-1||H===-1?null:{start:U,end:H}}else l=null}l=l||{start:0,end:0}}else l=null;for(gu={focusedElem:n,selectionRange:l},Ja=!1,We=s;We!==null;)if(s=We,n=s.child,(s.subtreeFlags&1028)!==0&&n!==null)n.return=s,We=n;else for(;We!==null;){s=We;try{var Ye=s.alternate;if((s.flags&1024)!==0)switch(s.tag){case 0:case 11:case 15:break;case 1:if(Ye!==null){var $e=Ye.memoizedProps,Yt=Ye.memoizedState,K=s.stateNode,W=K.getSnapshotBeforeUpdate(s.elementType===s.type?$e:wi(s.type,$e),Yt);K.__reactInternalSnapshotBeforeUpdate=W}break;case 3:var Q=s.stateNode.containerInfo;Q.nodeType===1?Q.textContent="":Q.nodeType===9&&Q.documentElement&&Q.removeChild(Q.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Pe){Xt(s,s.return,Pe)}if(n=s.sibling,n!==null){n.return=s.return,We=n;break}We=s.return}return Ye=Nm,Nm=!1,Ye}function da(n,s,l){var h=s.updateQueue;if(h=h!==null?h.lastEffect:null,h!==null){var p=h=h.next;do{if((p.tag&n)===n){var x=p.destroy;p.destroy=void 0,x!==void 0&&ih(s,l,x)}p=p.next}while(p!==h)}}function Nl(n,s){if(s=s.updateQueue,s=s!==null?s.lastEffect:null,s!==null){var l=s=s.next;do{if((l.tag&n)===n){var h=l.create;l.destroy=h()}l=l.next}while(l!==s)}}function rh(n){var s=n.ref;if(s!==null){var l=n.stateNode;switch(n.tag){case 5:n=l;break;default:n=l}typeof s=="function"?s(n):s.current=n}}function Um(n){var s=n.alternate;s!==null&&(n.alternate=null,Um(s)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(s=n.stateNode,s!==null&&(delete s[Ui],delete s[na],delete s[yu],delete s[hx],delete s[fx])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Fm(n){return n.tag===5||n.tag===3||n.tag===4}function Om(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Fm(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function sh(n,s,l){var h=n.tag;if(h===5||h===6)n=n.stateNode,s?l.nodeType===8?l.parentNode.insertBefore(n,s):l.insertBefore(n,s):(l.nodeType===8?(s=l.parentNode,s.insertBefore(n,l)):(s=l,s.appendChild(n)),l=l._reactRootContainer,l!=null||s.onclick!==null||(s.onclick=hl));else if(h!==4&&(n=n.child,n!==null))for(sh(n,s,l),n=n.sibling;n!==null;)sh(n,s,l),n=n.sibling}function oh(n,s,l){var h=n.tag;if(h===5||h===6)n=n.stateNode,s?l.insertBefore(n,s):l.appendChild(n);else if(h!==4&&(n=n.child,n!==null))for(oh(n,s,l),n=n.sibling;n!==null;)oh(n,s,l),n=n.sibling}var dn=null,Ei=!1;function Dr(n,s,l){for(l=l.child;l!==null;)km(n,s,l),l=l.sibling}function km(n,s,l){if(St&&typeof St.onCommitFiberUnmount=="function")try{St.onCommitFiberUnmount(bt,l)}catch{}switch(l.tag){case 5:En||Ks(l,s);case 6:var h=dn,p=Ei;dn=null,Dr(n,s,l),dn=h,Ei=p,dn!==null&&(Ei?(n=dn,l=l.stateNode,n.nodeType===8?n.parentNode.removeChild(l):n.removeChild(l)):dn.removeChild(l.stateNode));break;case 18:dn!==null&&(Ei?(n=dn,l=l.stateNode,n.nodeType===8?xu(n.parentNode,l):n.nodeType===1&&xu(n,l),Xo(n)):xu(dn,l.stateNode));break;case 4:h=dn,p=Ei,dn=l.stateNode.containerInfo,Ei=!0,Dr(n,s,l),dn=h,Ei=p;break;case 0:case 11:case 14:case 15:if(!En&&(h=l.updateQueue,h!==null&&(h=h.lastEffect,h!==null))){p=h=h.next;do{var x=p,E=x.destroy;x=x.tag,E!==void 0&&((x&2)!==0||(x&4)!==0)&&ih(l,s,E),p=p.next}while(p!==h)}Dr(n,s,l);break;case 1:if(!En&&(Ks(l,s),h=l.stateNode,typeof h.componentWillUnmount=="function"))try{h.props=l.memoizedProps,h.state=l.memoizedState,h.componentWillUnmount()}catch(U){Xt(l,s,U)}Dr(n,s,l);break;case 21:Dr(n,s,l);break;case 22:l.mode&1?(En=(h=En)||l.memoizedState!==null,Dr(n,s,l),En=h):Dr(n,s,l);break;default:Dr(n,s,l)}}function zm(n){var s=n.updateQueue;if(s!==null){n.updateQueue=null;var l=n.stateNode;l===null&&(l=n.stateNode=new Rx),s.forEach(function(h){var p=kx.bind(null,n,h);l.has(h)||(l.add(h),h.then(p,p))})}}function Ti(n,s){var l=s.deletions;if(l!==null)for(var h=0;h<l.length;h++){var p=l[h];try{var x=n,E=s,U=E;e:for(;U!==null;){switch(U.tag){case 5:dn=U.stateNode,Ei=!1;break e;case 3:dn=U.stateNode.containerInfo,Ei=!0;break e;case 4:dn=U.stateNode.containerInfo,Ei=!0;break e}U=U.return}if(dn===null)throw Error(t(160));km(x,E,p),dn=null,Ei=!1;var H=p.alternate;H!==null&&(H.return=null),p.return=null}catch(te){Xt(p,s,te)}}if(s.subtreeFlags&12854)for(s=s.child;s!==null;)Bm(s,n),s=s.sibling}function Bm(n,s){var l=n.alternate,h=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(Ti(s,n),ki(n),h&4){try{da(3,n,n.return),Nl(3,n)}catch($e){Xt(n,n.return,$e)}try{da(5,n,n.return)}catch($e){Xt(n,n.return,$e)}}break;case 1:Ti(s,n),ki(n),h&512&&l!==null&&Ks(l,l.return);break;case 5:if(Ti(s,n),ki(n),h&512&&l!==null&&Ks(l,l.return),n.flags&32){var p=n.stateNode;try{pt(p,"")}catch($e){Xt(n,n.return,$e)}}if(h&4&&(p=n.stateNode,p!=null)){var x=n.memoizedProps,E=l!==null?l.memoizedProps:x,U=n.type,H=n.updateQueue;if(n.updateQueue=null,H!==null)try{U==="input"&&x.type==="radio"&&x.name!=null&&Ee(p,x),ft(U,E);var te=ft(U,x);for(E=0;E<H.length;E+=2){var Se=H[E],Me=H[E+1];Se==="style"?at(p,Me):Se==="dangerouslySetInnerHTML"?Ge(p,Me):Se==="children"?pt(p,Me):P(p,Se,Me,te)}switch(U){case"input":Ve(p,x);break;case"textarea":de(p,x);break;case"select":var ye=p._wrapperState.wasMultiple;p._wrapperState.wasMultiple=!!x.multiple;var He=x.value;He!=null?D(p,!!x.multiple,He,!1):ye!==!!x.multiple&&(x.defaultValue!=null?D(p,!!x.multiple,x.defaultValue,!0):D(p,!!x.multiple,x.multiple?[]:"",!1))}p[na]=x}catch($e){Xt(n,n.return,$e)}}break;case 6:if(Ti(s,n),ki(n),h&4){if(n.stateNode===null)throw Error(t(162));p=n.stateNode,x=n.memoizedProps;try{p.nodeValue=x}catch($e){Xt(n,n.return,$e)}}break;case 3:if(Ti(s,n),ki(n),h&4&&l!==null&&l.memoizedState.isDehydrated)try{Xo(s.containerInfo)}catch($e){Xt(n,n.return,$e)}break;case 4:Ti(s,n),ki(n);break;case 13:Ti(s,n),ki(n),p=n.child,p.flags&8192&&(x=p.memoizedState!==null,p.stateNode.isHidden=x,!x||p.alternate!==null&&p.alternate.memoizedState!==null||(ch=Ce())),h&4&&zm(n);break;case 22:if(Se=l!==null&&l.memoizedState!==null,n.mode&1?(En=(te=En)||Se,Ti(s,n),En=te):Ti(s,n),ki(n),h&8192){if(te=n.memoizedState!==null,(n.stateNode.isHidden=te)&&!Se&&(n.mode&1)!==0)for(We=n,Se=n.child;Se!==null;){for(Me=We=Se;We!==null;){switch(ye=We,He=ye.child,ye.tag){case 0:case 11:case 14:case 15:da(4,ye,ye.return);break;case 1:Ks(ye,ye.return);var Ye=ye.stateNode;if(typeof Ye.componentWillUnmount=="function"){h=ye,l=ye.return;try{s=h,Ye.props=s.memoizedProps,Ye.state=s.memoizedState,Ye.componentWillUnmount()}catch($e){Xt(h,l,$e)}}break;case 5:Ks(ye,ye.return);break;case 22:if(ye.memoizedState!==null){Gm(Me);continue}}He!==null?(He.return=ye,We=He):Gm(Me)}Se=Se.sibling}e:for(Se=null,Me=n;;){if(Me.tag===5){if(Se===null){Se=Me;try{p=Me.stateNode,te?(x=p.style,typeof x.setProperty=="function"?x.setProperty("display","none","important"):x.display="none"):(U=Me.stateNode,H=Me.memoizedProps.style,E=H!=null&&H.hasOwnProperty("display")?H.display:null,U.style.display=ot("display",E))}catch($e){Xt(n,n.return,$e)}}}else if(Me.tag===6){if(Se===null)try{Me.stateNode.nodeValue=te?"":Me.memoizedProps}catch($e){Xt(n,n.return,$e)}}else if((Me.tag!==22&&Me.tag!==23||Me.memoizedState===null||Me===n)&&Me.child!==null){Me.child.return=Me,Me=Me.child;continue}if(Me===n)break e;for(;Me.sibling===null;){if(Me.return===null||Me.return===n)break e;Se===Me&&(Se=null),Me=Me.return}Se===Me&&(Se=null),Me.sibling.return=Me.return,Me=Me.sibling}}break;case 19:Ti(s,n),ki(n),h&4&&zm(n);break;case 21:break;default:Ti(s,n),ki(n)}}function ki(n){var s=n.flags;if(s&2){try{e:{for(var l=n.return;l!==null;){if(Fm(l)){var h=l;break e}l=l.return}throw Error(t(160))}switch(h.tag){case 5:var p=h.stateNode;h.flags&32&&(pt(p,""),h.flags&=-33);var x=Om(n);oh(n,x,p);break;case 3:case 4:var E=h.stateNode.containerInfo,U=Om(n);sh(n,U,E);break;default:throw Error(t(161))}}catch(H){Xt(n,n.return,H)}n.flags&=-3}s&4096&&(n.flags&=-4097)}function bx(n,s,l){We=n,Hm(n)}function Hm(n,s,l){for(var h=(n.mode&1)!==0;We!==null;){var p=We,x=p.child;if(p.tag===22&&h){var E=p.memoizedState!==null||Il;if(!E){var U=p.alternate,H=U!==null&&U.memoizedState!==null||En;U=Il;var te=En;if(Il=E,(En=H)&&!te)for(We=p;We!==null;)E=We,H=E.child,E.tag===22&&E.memoizedState!==null?Wm(p):H!==null?(H.return=E,We=H):Wm(p);for(;x!==null;)We=x,Hm(x),x=x.sibling;We=p,Il=U,En=te}Vm(n)}else(p.subtreeFlags&8772)!==0&&x!==null?(x.return=p,We=x):Vm(n)}}function Vm(n){for(;We!==null;){var s=We;if((s.flags&8772)!==0){var l=s.alternate;try{if((s.flags&8772)!==0)switch(s.tag){case 0:case 11:case 15:En||Nl(5,s);break;case 1:var h=s.stateNode;if(s.flags&4&&!En)if(l===null)h.componentDidMount();else{var p=s.elementType===s.type?l.memoizedProps:wi(s.type,l.memoizedProps);h.componentDidUpdate(p,l.memoizedState,h.__reactInternalSnapshotBeforeUpdate)}var x=s.updateQueue;x!==null&&Gp(s,x,h);break;case 3:var E=s.updateQueue;if(E!==null){if(l=null,s.child!==null)switch(s.child.tag){case 5:l=s.child.stateNode;break;case 1:l=s.child.stateNode}Gp(s,E,l)}break;case 5:var U=s.stateNode;if(l===null&&s.flags&4){l=U;var H=s.memoizedProps;switch(s.type){case"button":case"input":case"select":case"textarea":H.autoFocus&&l.focus();break;case"img":H.src&&(l.src=H.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(s.memoizedState===null){var te=s.alternate;if(te!==null){var Se=te.memoizedState;if(Se!==null){var Me=Se.dehydrated;Me!==null&&Xo(Me)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}En||s.flags&512&&rh(s)}catch(ye){Xt(s,s.return,ye)}}if(s===n){We=null;break}if(l=s.sibling,l!==null){l.return=s.return,We=l;break}We=s.return}}function Gm(n){for(;We!==null;){var s=We;if(s===n){We=null;break}var l=s.sibling;if(l!==null){l.return=s.return,We=l;break}We=s.return}}function Wm(n){for(;We!==null;){var s=We;try{switch(s.tag){case 0:case 11:case 15:var l=s.return;try{Nl(4,s)}catch(H){Xt(s,l,H)}break;case 1:var h=s.stateNode;if(typeof h.componentDidMount=="function"){var p=s.return;try{h.componentDidMount()}catch(H){Xt(s,p,H)}}var x=s.return;try{rh(s)}catch(H){Xt(s,x,H)}break;case 5:var E=s.return;try{rh(s)}catch(H){Xt(s,E,H)}}}catch(H){Xt(s,s.return,H)}if(s===n){We=null;break}var U=s.sibling;if(U!==null){U.return=s.return,We=U;break}We=s.return}}var Lx=Math.ceil,Ul=T.ReactCurrentDispatcher,ah=T.ReactCurrentOwner,hi=T.ReactCurrentBatchConfig,Et=0,ln=null,Kt=null,pn=0,ei=0,$s=Cr(0),nn=0,pa=null,os=0,Fl=0,lh=0,ma=null,Xn=null,ch=0,Zs=1/0,rr=null,Ol=!1,uh=null,Ir=null,kl=!1,Nr=null,zl=0,ga=0,hh=null,Bl=-1,Hl=0;function In(){return(Et&6)!==0?Ce():Bl!==-1?Bl:Bl=Ce()}function Ur(n){return(n.mode&1)===0?1:(Et&2)!==0&&pn!==0?pn&-pn:px.transition!==null?(Hl===0&&(Hl=Ln()),Hl):(n=Dt,n!==0||(n=window.event,n=n===void 0?16:jd(n.type)),n)}function Ai(n,s,l,h){if(50<ga)throw ga=0,hh=null,Error(t(185));Hn(n,l,h),((Et&2)===0||n!==ln)&&(n===ln&&((Et&2)===0&&(Fl|=l),nn===4&&Fr(n,pn)),jn(n,h),l===1&&Et===0&&(s.mode&1)===0&&(Zs=Ce()+500,ml&&Pr()))}function jn(n,s){var l=n.callbackNode;si(n,s);var h=Ni(n,n===ln?pn:0);if(h===0)l!==null&&re(l),n.callbackNode=null,n.callbackPriority=0;else if(s=h&-h,n.callbackPriority!==s){if(l!=null&&re(l),s===1)n.tag===0?dx(jm.bind(null,n)):Lp(jm.bind(null,n)),cx(function(){(Et&6)===0&&Pr()}),l=null;else{switch(kd(h)){case 1:l=Ke;break;case 4:l=lt;break;case 16:l=ut;break;case 536870912:l=Mt;break;default:l=ut}l=eg(l,Xm.bind(null,n))}n.callbackPriority=s,n.callbackNode=l}}function Xm(n,s){if(Bl=-1,Hl=0,(Et&6)!==0)throw Error(t(327));var l=n.callbackNode;if(Qs()&&n.callbackNode!==l)return null;var h=Ni(n,n===ln?pn:0);if(h===0)return null;if((h&30)!==0||(h&n.expiredLanes)!==0||s)s=Vl(n,h);else{s=h;var p=Et;Et|=2;var x=qm();(ln!==n||pn!==s)&&(rr=null,Zs=Ce()+500,ls(n,s));do try{Nx();break}catch(U){Ym(n,U)}while(!0);Pu(),Ul.current=x,Et=p,Kt!==null?s=0:(ln=null,pn=0,s=nn)}if(s!==0){if(s===2&&(p=$i(n),p!==0&&(h=p,s=fh(n,p))),s===1)throw l=pa,ls(n,0),Fr(n,h),jn(n,Ce()),l;if(s===6)Fr(n,h);else{if(p=n.current.alternate,(h&30)===0&&!Dx(p)&&(s=Vl(n,h),s===2&&(x=$i(n),x!==0&&(h=x,s=fh(n,x))),s===1))throw l=pa,ls(n,0),Fr(n,h),jn(n,Ce()),l;switch(n.finishedWork=p,n.finishedLanes=h,s){case 0:case 1:throw Error(t(345));case 2:cs(n,Xn,rr);break;case 3:if(Fr(n,h),(h&130023424)===h&&(s=ch+500-Ce(),10<s)){if(Ni(n,0)!==0)break;if(p=n.suspendedLanes,(p&h)!==h){In(),n.pingedLanes|=n.suspendedLanes&p;break}n.timeoutHandle=_u(cs.bind(null,n,Xn,rr),s);break}cs(n,Xn,rr);break;case 4:if(Fr(n,h),(h&4194240)===h)break;for(s=n.eventTimes,p=-1;0<h;){var E=31-mt(h);x=1<<E,E=s[E],E>p&&(p=E),h&=~x}if(h=p,h=Ce()-h,h=(120>h?120:480>h?480:1080>h?1080:1920>h?1920:3e3>h?3e3:4320>h?4320:1960*Lx(h/1960))-h,10<h){n.timeoutHandle=_u(cs.bind(null,n,Xn,rr),h);break}cs(n,Xn,rr);break;case 5:cs(n,Xn,rr);break;default:throw Error(t(329))}}}return jn(n,Ce()),n.callbackNode===l?Xm.bind(null,n):null}function fh(n,s){var l=ma;return n.current.memoizedState.isDehydrated&&(ls(n,s).flags|=256),n=Vl(n,s),n!==2&&(s=Xn,Xn=l,s!==null&&dh(s)),n}function dh(n){Xn===null?Xn=n:Xn.push.apply(Xn,n)}function Dx(n){for(var s=n;;){if(s.flags&16384){var l=s.updateQueue;if(l!==null&&(l=l.stores,l!==null))for(var h=0;h<l.length;h++){var p=l[h],x=p.getSnapshot;p=p.value;try{if(!Si(x(),p))return!1}catch{return!1}}}if(l=s.child,s.subtreeFlags&16384&&l!==null)l.return=s,s=l;else{if(s===n)break;for(;s.sibling===null;){if(s.return===null||s.return===n)return!0;s=s.return}s.sibling.return=s.return,s=s.sibling}}return!0}function Fr(n,s){for(s&=~lh,s&=~Fl,n.suspendedLanes|=s,n.pingedLanes&=~s,n=n.expirationTimes;0<s;){var l=31-mt(s),h=1<<l;n[l]=-1,s&=~h}}function jm(n){if((Et&6)!==0)throw Error(t(327));Qs();var s=Ni(n,0);if((s&1)===0)return jn(n,Ce()),null;var l=Vl(n,s);if(n.tag!==0&&l===2){var h=$i(n);h!==0&&(s=h,l=fh(n,h))}if(l===1)throw l=pa,ls(n,0),Fr(n,s),jn(n,Ce()),l;if(l===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=s,cs(n,Xn,rr),jn(n,Ce()),null}function ph(n,s){var l=Et;Et|=1;try{return n(s)}finally{Et=l,Et===0&&(Zs=Ce()+500,ml&&Pr())}}function as(n){Nr!==null&&Nr.tag===0&&(Et&6)===0&&Qs();var s=Et;Et|=1;var l=hi.transition,h=Dt;try{if(hi.transition=null,Dt=1,n)return n()}finally{Dt=h,hi.transition=l,Et=s,(Et&6)===0&&Pr()}}function mh(){ei=$s.current,zt($s)}function ls(n,s){n.finishedWork=null,n.finishedLanes=0;var l=n.timeoutHandle;if(l!==-1&&(n.timeoutHandle=-1,lx(l)),Kt!==null)for(l=Kt.return;l!==null;){var h=l;switch(Eu(h),h.tag){case 1:h=h.type.childContextTypes,h!=null&&dl();break;case 3:Ys(),zt(Vn),zt(Sn),Ou();break;case 5:Uu(h);break;case 4:Ys();break;case 13:zt(Vt);break;case 19:zt(Vt);break;case 10:bu(h.type._context);break;case 22:case 23:mh()}l=l.return}if(ln=n,Kt=n=Or(n.current,null),pn=ei=s,nn=0,pa=null,lh=Fl=os=0,Xn=ma=null,is!==null){for(s=0;s<is.length;s++)if(l=is[s],h=l.interleaved,h!==null){l.interleaved=null;var p=h.next,x=l.pending;if(x!==null){var E=x.next;x.next=p,h.next=E}l.pending=h}is=null}return n}function Ym(n,s){do{var l=Kt;try{if(Pu(),Tl.current=Pl,Al){for(var h=Gt.memoizedState;h!==null;){var p=h.queue;p!==null&&(p.pending=null),h=h.next}Al=!1}if(ss=0,an=tn=Gt=null,la=!1,ca=0,ah.current=null,l===null||l.return===null){nn=1,pa=s,Kt=null;break}e:{var x=n,E=l.return,U=l,H=s;if(s=pn,U.flags|=32768,H!==null&&typeof H=="object"&&typeof H.then=="function"){var te=H,Se=U,Me=Se.tag;if((Se.mode&1)===0&&(Me===0||Me===11||Me===15)){var ye=Se.alternate;ye?(Se.updateQueue=ye.updateQueue,Se.memoizedState=ye.memoizedState,Se.lanes=ye.lanes):(Se.updateQueue=null,Se.memoizedState=null)}var He=_m(E);if(He!==null){He.flags&=-257,xm(He,E,U,x,s),He.mode&1&&vm(x,te,s),s=He,H=te;var Ye=s.updateQueue;if(Ye===null){var $e=new Set;$e.add(H),s.updateQueue=$e}else Ye.add(H);break e}else{if((s&1)===0){vm(x,te,s),gh();break e}H=Error(t(426))}}else if(Bt&&U.mode&1){var Yt=_m(E);if(Yt!==null){(Yt.flags&65536)===0&&(Yt.flags|=256),xm(Yt,E,U,x,s),Cu(qs(H,U));break e}}x=H=qs(H,U),nn!==4&&(nn=2),ma===null?ma=[x]:ma.push(x),x=E;do{switch(x.tag){case 3:x.flags|=65536,s&=-s,x.lanes|=s;var K=mm(x,H,s);Vp(x,K);break e;case 1:U=H;var W=x.type,Q=x.stateNode;if((x.flags&128)===0&&(typeof W.getDerivedStateFromError=="function"||Q!==null&&typeof Q.componentDidCatch=="function"&&(Ir===null||!Ir.has(Q)))){x.flags|=65536,s&=-s,x.lanes|=s;var Pe=gm(x,U,s);Vp(x,Pe);break e}}x=x.return}while(x!==null)}$m(l)}catch(tt){s=tt,Kt===l&&l!==null&&(Kt=l=l.return);continue}break}while(!0)}function qm(){var n=Ul.current;return Ul.current=Pl,n===null?Pl:n}function gh(){(nn===0||nn===3||nn===2)&&(nn=4),ln===null||(os&268435455)===0&&(Fl&268435455)===0||Fr(ln,pn)}function Vl(n,s){var l=Et;Et|=2;var h=qm();(ln!==n||pn!==s)&&(rr=null,ls(n,s));do try{Ix();break}catch(p){Ym(n,p)}while(!0);if(Pu(),Et=l,Ul.current=h,Kt!==null)throw Error(t(261));return ln=null,pn=0,nn}function Ix(){for(;Kt!==null;)Km(Kt)}function Nx(){for(;Kt!==null&&!q();)Km(Kt)}function Km(n){var s=Jm(n.alternate,n,ei);n.memoizedProps=n.pendingProps,s===null?$m(n):Kt=s,ah.current=null}function $m(n){var s=n;do{var l=s.alternate;if(n=s.return,(s.flags&32768)===0){if(l=Ax(l,s,ei),l!==null){Kt=l;return}}else{if(l=Cx(l,s),l!==null){l.flags&=32767,Kt=l;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{nn=6,Kt=null;return}}if(s=s.sibling,s!==null){Kt=s;return}Kt=s=n}while(s!==null);nn===0&&(nn=5)}function cs(n,s,l){var h=Dt,p=hi.transition;try{hi.transition=null,Dt=1,Ux(n,s,l,h)}finally{hi.transition=p,Dt=h}return null}function Ux(n,s,l,h){do Qs();while(Nr!==null);if((Et&6)!==0)throw Error(t(327));l=n.finishedWork;var p=n.finishedLanes;if(l===null)return null;if(n.finishedWork=null,n.finishedLanes=0,l===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var x=l.lanes|l.childLanes;if($a(n,x),n===ln&&(Kt=ln=null,pn=0),(l.subtreeFlags&2064)===0&&(l.flags&2064)===0||kl||(kl=!0,eg(ut,function(){return Qs(),null})),x=(l.flags&15990)!==0,(l.subtreeFlags&15990)!==0||x){x=hi.transition,hi.transition=null;var E=Dt;Dt=1;var U=Et;Et|=4,ah.current=null,Px(n,l),Bm(l,n),tx(gu),Ja=!!mu,gu=mu=null,n.current=l,bx(l),be(),Et=U,Dt=E,hi.transition=x}else n.current=l;if(kl&&(kl=!1,Nr=n,zl=p),x=n.pendingLanes,x===0&&(Ir=null),xn(l.stateNode),jn(n,Ce()),s!==null)for(h=n.onRecoverableError,l=0;l<s.length;l++)p=s[l],h(p.value,{componentStack:p.stack,digest:p.digest});if(Ol)throw Ol=!1,n=uh,uh=null,n;return(zl&1)!==0&&n.tag!==0&&Qs(),x=n.pendingLanes,(x&1)!==0?n===hh?ga++:(ga=0,hh=n):ga=0,Pr(),null}function Qs(){if(Nr!==null){var n=kd(zl),s=hi.transition,l=Dt;try{if(hi.transition=null,Dt=16>n?16:n,Nr===null)var h=!1;else{if(n=Nr,Nr=null,zl=0,(Et&6)!==0)throw Error(t(331));var p=Et;for(Et|=4,We=n.current;We!==null;){var x=We,E=x.child;if((We.flags&16)!==0){var U=x.deletions;if(U!==null){for(var H=0;H<U.length;H++){var te=U[H];for(We=te;We!==null;){var Se=We;switch(Se.tag){case 0:case 11:case 15:da(8,Se,x)}var Me=Se.child;if(Me!==null)Me.return=Se,We=Me;else for(;We!==null;){Se=We;var ye=Se.sibling,He=Se.return;if(Um(Se),Se===te){We=null;break}if(ye!==null){ye.return=He,We=ye;break}We=He}}}var Ye=x.alternate;if(Ye!==null){var $e=Ye.child;if($e!==null){Ye.child=null;do{var Yt=$e.sibling;$e.sibling=null,$e=Yt}while($e!==null)}}We=x}}if((x.subtreeFlags&2064)!==0&&E!==null)E.return=x,We=E;else e:for(;We!==null;){if(x=We,(x.flags&2048)!==0)switch(x.tag){case 0:case 11:case 15:da(9,x,x.return)}var K=x.sibling;if(K!==null){K.return=x.return,We=K;break e}We=x.return}}var W=n.current;for(We=W;We!==null;){E=We;var Q=E.child;if((E.subtreeFlags&2064)!==0&&Q!==null)Q.return=E,We=Q;else e:for(E=W;We!==null;){if(U=We,(U.flags&2048)!==0)try{switch(U.tag){case 0:case 11:case 15:Nl(9,U)}}catch(tt){Xt(U,U.return,tt)}if(U===E){We=null;break e}var Pe=U.sibling;if(Pe!==null){Pe.return=U.return,We=Pe;break e}We=U.return}}if(Et=p,Pr(),St&&typeof St.onPostCommitFiberRoot=="function")try{St.onPostCommitFiberRoot(bt,n)}catch{}h=!0}return h}finally{Dt=l,hi.transition=s}}return!1}function Zm(n,s,l){s=qs(l,s),s=mm(n,s,1),n=Lr(n,s,1),s=In(),n!==null&&(Hn(n,1,s),jn(n,s))}function Xt(n,s,l){if(n.tag===3)Zm(n,n,l);else for(;s!==null;){if(s.tag===3){Zm(s,n,l);break}else if(s.tag===1){var h=s.stateNode;if(typeof s.type.getDerivedStateFromError=="function"||typeof h.componentDidCatch=="function"&&(Ir===null||!Ir.has(h))){n=qs(l,n),n=gm(s,n,1),s=Lr(s,n,1),n=In(),s!==null&&(Hn(s,1,n),jn(s,n));break}}s=s.return}}function Fx(n,s,l){var h=n.pingCache;h!==null&&h.delete(s),s=In(),n.pingedLanes|=n.suspendedLanes&l,ln===n&&(pn&l)===l&&(nn===4||nn===3&&(pn&130023424)===pn&&500>Ce()-ch?ls(n,0):lh|=l),jn(n,s)}function Qm(n,s){s===0&&((n.mode&1)===0?s=1:(s=yi,yi<<=1,(yi&130023424)===0&&(yi=4194304)));var l=In();n=tr(n,s),n!==null&&(Hn(n,s,l),jn(n,l))}function Ox(n){var s=n.memoizedState,l=0;s!==null&&(l=s.retryLane),Qm(n,l)}function kx(n,s){var l=0;switch(n.tag){case 13:var h=n.stateNode,p=n.memoizedState;p!==null&&(l=p.retryLane);break;case 19:h=n.stateNode;break;default:throw Error(t(314))}h!==null&&h.delete(s),Qm(n,l)}var Jm;Jm=function(n,s,l){if(n!==null)if(n.memoizedProps!==s.pendingProps||Vn.current)Wn=!0;else{if((n.lanes&l)===0&&(s.flags&128)===0)return Wn=!1,Tx(n,s,l);Wn=(n.flags&131072)!==0}else Wn=!1,Bt&&(s.flags&1048576)!==0&&Dp(s,vl,s.index);switch(s.lanes=0,s.tag){case 2:var h=s.type;Dl(n,s),n=s.pendingProps;var p=Bs(s,Sn.current);js(s,l),p=Bu(null,s,h,n,p,l);var x=Hu();return s.flags|=1,typeof p=="object"&&p!==null&&typeof p.render=="function"&&p.$$typeof===void 0?(s.tag=1,s.memoizedState=null,s.updateQueue=null,Gn(h)?(x=!0,pl(s)):x=!1,s.memoizedState=p.state!==null&&p.state!==void 0?p.state:null,Iu(s),p.updater=bl,s.stateNode=p,p._reactInternals=s,Yu(s,h,n,l),s=Zu(null,s,h,!0,x,l)):(s.tag=0,Bt&&x&&wu(s),Dn(null,s,p,l),s=s.child),s;case 16:h=s.elementType;e:{switch(Dl(n,s),n=s.pendingProps,p=h._init,h=p(h._payload),s.type=h,p=s.tag=Bx(h),n=wi(h,n),p){case 0:s=$u(null,s,h,n,l);break e;case 1:s=Tm(null,s,h,n,l);break e;case 11:s=ym(null,s,h,n,l);break e;case 14:s=Sm(null,s,h,wi(h.type,n),l);break e}throw Error(t(306,h,""))}return s;case 0:return h=s.type,p=s.pendingProps,p=s.elementType===h?p:wi(h,p),$u(n,s,h,p,l);case 1:return h=s.type,p=s.pendingProps,p=s.elementType===h?p:wi(h,p),Tm(n,s,h,p,l);case 3:e:{if(Am(s),n===null)throw Error(t(387));h=s.pendingProps,x=s.memoizedState,p=x.element,Hp(n,s),wl(s,h,null,l);var E=s.memoizedState;if(h=E.element,x.isDehydrated)if(x={element:h,isDehydrated:!1,cache:E.cache,pendingSuspenseBoundaries:E.pendingSuspenseBoundaries,transitions:E.transitions},s.updateQueue.baseState=x,s.memoizedState=x,s.flags&256){p=qs(Error(t(423)),s),s=Cm(n,s,h,l,p);break e}else if(h!==p){p=qs(Error(t(424)),s),s=Cm(n,s,h,l,p);break e}else for(Jn=Ar(s.stateNode.containerInfo.firstChild),Qn=s,Bt=!0,Mi=null,l=zp(s,null,h,l),s.child=l;l;)l.flags=l.flags&-3|4096,l=l.sibling;else{if(Gs(),h===p){s=ir(n,s,l);break e}Dn(n,s,h,l)}s=s.child}return s;case 5:return Wp(s),n===null&&Au(s),h=s.type,p=s.pendingProps,x=n!==null?n.memoizedProps:null,E=p.children,vu(h,p)?E=null:x!==null&&vu(h,x)&&(s.flags|=32),Em(n,s),Dn(n,s,E,l),s.child;case 6:return n===null&&Au(s),null;case 13:return Rm(n,s,l);case 4:return Nu(s,s.stateNode.containerInfo),h=s.pendingProps,n===null?s.child=Ws(s,null,h,l):Dn(n,s,h,l),s.child;case 11:return h=s.type,p=s.pendingProps,p=s.elementType===h?p:wi(h,p),ym(n,s,h,p,l);case 7:return Dn(n,s,s.pendingProps,l),s.child;case 8:return Dn(n,s,s.pendingProps.children,l),s.child;case 12:return Dn(n,s,s.pendingProps.children,l),s.child;case 10:e:{if(h=s.type._context,p=s.pendingProps,x=s.memoizedProps,E=p.value,Ft(yl,h._currentValue),h._currentValue=E,x!==null)if(Si(x.value,E)){if(x.children===p.children&&!Vn.current){s=ir(n,s,l);break e}}else for(x=s.child,x!==null&&(x.return=s);x!==null;){var U=x.dependencies;if(U!==null){E=x.child;for(var H=U.firstContext;H!==null;){if(H.context===h){if(x.tag===1){H=nr(-1,l&-l),H.tag=2;var te=x.updateQueue;if(te!==null){te=te.shared;var Se=te.pending;Se===null?H.next=H:(H.next=Se.next,Se.next=H),te.pending=H}}x.lanes|=l,H=x.alternate,H!==null&&(H.lanes|=l),Lu(x.return,l,s),U.lanes|=l;break}H=H.next}}else if(x.tag===10)E=x.type===s.type?null:x.child;else if(x.tag===18){if(E=x.return,E===null)throw Error(t(341));E.lanes|=l,U=E.alternate,U!==null&&(U.lanes|=l),Lu(E,l,s),E=x.sibling}else E=x.child;if(E!==null)E.return=x;else for(E=x;E!==null;){if(E===s){E=null;break}if(x=E.sibling,x!==null){x.return=E.return,E=x;break}E=E.return}x=E}Dn(n,s,p.children,l),s=s.child}return s;case 9:return p=s.type,h=s.pendingProps.children,js(s,l),p=ci(p),h=h(p),s.flags|=1,Dn(n,s,h,l),s.child;case 14:return h=s.type,p=wi(h,s.pendingProps),p=wi(h.type,p),Sm(n,s,h,p,l);case 15:return Mm(n,s,s.type,s.pendingProps,l);case 17:return h=s.type,p=s.pendingProps,p=s.elementType===h?p:wi(h,p),Dl(n,s),s.tag=1,Gn(h)?(n=!0,pl(s)):n=!1,js(s,l),dm(s,h,p),Yu(s,h,p,l),Zu(null,s,h,!0,n,l);case 19:return bm(n,s,l);case 22:return wm(n,s,l)}throw Error(t(156,s.tag))};function eg(n,s){return ne(n,s)}function zx(n,s,l,h){this.tag=n,this.key=l,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=s,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=h,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function fi(n,s,l,h){return new zx(n,s,l,h)}function vh(n){return n=n.prototype,!(!n||!n.isReactComponent)}function Bx(n){if(typeof n=="function")return vh(n)?1:0;if(n!=null){if(n=n.$$typeof,n===$)return 11;if(n===ce)return 14}return 2}function Or(n,s){var l=n.alternate;return l===null?(l=fi(n.tag,s,n.key,n.mode),l.elementType=n.elementType,l.type=n.type,l.stateNode=n.stateNode,l.alternate=n,n.alternate=l):(l.pendingProps=s,l.type=n.type,l.flags=0,l.subtreeFlags=0,l.deletions=null),l.flags=n.flags&14680064,l.childLanes=n.childLanes,l.lanes=n.lanes,l.child=n.child,l.memoizedProps=n.memoizedProps,l.memoizedState=n.memoizedState,l.updateQueue=n.updateQueue,s=n.dependencies,l.dependencies=s===null?null:{lanes:s.lanes,firstContext:s.firstContext},l.sibling=n.sibling,l.index=n.index,l.ref=n.ref,l}function Gl(n,s,l,h,p,x){var E=2;if(h=n,typeof n=="function")vh(n)&&(E=1);else if(typeof n=="string")E=5;else e:switch(n){case N:return us(l.children,p,x,s);case z:E=8,p|=8;break;case R:return n=fi(12,l,s,p|2),n.elementType=R,n.lanes=x,n;case Y:return n=fi(13,l,s,p),n.elementType=Y,n.lanes=x,n;case ie:return n=fi(19,l,s,p),n.elementType=ie,n.lanes=x,n;case ue:return Wl(l,p,x,s);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case A:E=10;break e;case F:E=9;break e;case $:E=11;break e;case ce:E=14;break e;case oe:E=16,h=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return s=fi(E,l,s,p),s.elementType=n,s.type=h,s.lanes=x,s}function us(n,s,l,h){return n=fi(7,n,h,s),n.lanes=l,n}function Wl(n,s,l,h){return n=fi(22,n,h,s),n.elementType=ue,n.lanes=l,n.stateNode={isHidden:!1},n}function _h(n,s,l){return n=fi(6,n,null,s),n.lanes=l,n}function xh(n,s,l){return s=fi(4,n.children!==null?n.children:[],n.key,s),s.lanes=l,s.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},s}function Hx(n,s,l,h,p){this.tag=s,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=oi(0),this.expirationTimes=oi(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=oi(0),this.identifierPrefix=h,this.onRecoverableError=p,this.mutableSourceEagerHydrationData=null}function yh(n,s,l,h,p,x,E,U,H){return n=new Hx(n,s,l,U,H),s===1?(s=1,x===!0&&(s|=8)):s=0,x=fi(3,null,null,s),n.current=x,x.stateNode=n,x.memoizedState={element:h,isDehydrated:l,cache:null,transitions:null,pendingSuspenseBoundaries:null},Iu(x),n}function Vx(n,s,l){var h=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:I,key:h==null?null:""+h,children:n,containerInfo:s,implementation:l}}function tg(n){if(!n)return Rr;n=n._reactInternals;e:{if(Ii(n)!==n||n.tag!==1)throw Error(t(170));var s=n;do{switch(s.tag){case 3:s=s.stateNode.context;break e;case 1:if(Gn(s.type)){s=s.stateNode.__reactInternalMemoizedMergedChildContext;break e}}s=s.return}while(s!==null);throw Error(t(171))}if(n.tag===1){var l=n.type;if(Gn(l))return Pp(n,l,s)}return s}function ng(n,s,l,h,p,x,E,U,H){return n=yh(l,h,!0,n,p,x,E,U,H),n.context=tg(null),l=n.current,h=In(),p=Ur(l),x=nr(h,p),x.callback=s??null,Lr(l,x,p),n.current.lanes=p,Hn(n,p,h),jn(n,h),n}function Xl(n,s,l,h){var p=s.current,x=In(),E=Ur(p);return l=tg(l),s.context===null?s.context=l:s.pendingContext=l,s=nr(x,E),s.payload={element:n},h=h===void 0?null:h,h!==null&&(s.callback=h),n=Lr(p,s,E),n!==null&&(Ai(n,p,E,x),Ml(n,p,E)),E}function jl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function ig(n,s){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var l=n.retryLane;n.retryLane=l!==0&&l<s?l:s}}function Sh(n,s){ig(n,s),(n=n.alternate)&&ig(n,s)}function Gx(){return null}var rg=typeof reportError=="function"?reportError:function(n){console.error(n)};function Mh(n){this._internalRoot=n}Yl.prototype.render=Mh.prototype.render=function(n){var s=this._internalRoot;if(s===null)throw Error(t(409));Xl(n,s,null,null)},Yl.prototype.unmount=Mh.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var s=n.containerInfo;as(function(){Xl(null,n,null,null)}),s[Zi]=null}};function Yl(n){this._internalRoot=n}Yl.prototype.unstable_scheduleHydration=function(n){if(n){var s=Hd();n={blockedOn:null,target:n,priority:s};for(var l=0;l<wr.length&&s!==0&&s<wr[l].priority;l++);wr.splice(l,0,n),l===0&&Wd(n)}};function wh(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function ql(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function sg(){}function Wx(n,s,l,h,p){if(p){if(typeof h=="function"){var x=h;h=function(){var te=jl(E);x.call(te)}}var E=ng(s,h,n,0,null,!1,!1,"",sg);return n._reactRootContainer=E,n[Zi]=E.current,ea(n.nodeType===8?n.parentNode:n),as(),E}for(;p=n.lastChild;)n.removeChild(p);if(typeof h=="function"){var U=h;h=function(){var te=jl(H);U.call(te)}}var H=yh(n,0,!1,null,null,!1,!1,"",sg);return n._reactRootContainer=H,n[Zi]=H.current,ea(n.nodeType===8?n.parentNode:n),as(function(){Xl(s,H,l,h)}),H}function Kl(n,s,l,h,p){var x=l._reactRootContainer;if(x){var E=x;if(typeof p=="function"){var U=p;p=function(){var H=jl(E);U.call(H)}}Xl(s,E,n,p)}else E=Wx(l,s,n,p,h);return jl(E)}zd=function(n){switch(n.tag){case 3:var s=n.stateNode;if(s.current.memoizedState.isDehydrated){var l=en(s.pendingLanes);l!==0&&(Yc(s,l|1),jn(s,Ce()),(Et&6)===0&&(Zs=Ce()+500,Pr()))}break;case 13:as(function(){var h=tr(n,1);if(h!==null){var p=In();Ai(h,n,1,p)}}),Sh(n,1)}},qc=function(n){if(n.tag===13){var s=tr(n,134217728);if(s!==null){var l=In();Ai(s,n,134217728,l)}Sh(n,134217728)}},Bd=function(n){if(n.tag===13){var s=Ur(n),l=tr(n,s);if(l!==null){var h=In();Ai(l,n,s,h)}Sh(n,s)}},Hd=function(){return Dt},Vd=function(n,s){var l=Dt;try{return Dt=n,s()}finally{Dt=l}},Ie=function(n,s,l){switch(s){case"input":if(Ve(n,l),s=l.name,l.type==="radio"&&s!=null){for(l=n;l.parentNode;)l=l.parentNode;for(l=l.querySelectorAll("input[name="+JSON.stringify(""+s)+'][type="radio"]'),s=0;s<l.length;s++){var h=l[s];if(h!==n&&h.form===n.form){var p=fl(h);if(!p)throw Error(t(90));_e(h),Ve(h,p)}}}break;case"textarea":de(n,l);break;case"select":s=l.value,s!=null&&D(n,!!l.multiple,s,!1)}},Ot=ph,Jt=as;var Xx={usingClientEntryPoint:!1,Events:[ia,ks,fl,Ue,dt,ph]},va={findFiberByHostInstance:Jr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},jx={bundleType:va.bundleType,version:va.version,rendererPackageName:va.rendererPackageName,rendererConfig:va.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:T.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=b(n),n===null?null:n.stateNode},findFiberByHostInstance:va.findFiberByHostInstance||Gx,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var $l=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!$l.isDisabled&&$l.supportsFiber)try{bt=$l.inject(jx),St=$l}catch{}}return Yn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Xx,Yn.createPortal=function(n,s){var l=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!wh(s))throw Error(t(200));return Vx(n,s,null,l)},Yn.createRoot=function(n,s){if(!wh(n))throw Error(t(299));var l=!1,h="",p=rg;return s!=null&&(s.unstable_strictMode===!0&&(l=!0),s.identifierPrefix!==void 0&&(h=s.identifierPrefix),s.onRecoverableError!==void 0&&(p=s.onRecoverableError)),s=yh(n,1,!1,null,null,l,!1,h,p),n[Zi]=s.current,ea(n.nodeType===8?n.parentNode:n),new Mh(s)},Yn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var s=n._reactInternals;if(s===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=b(s),n=n===null?null:n.stateNode,n},Yn.flushSync=function(n){return as(n)},Yn.hydrate=function(n,s,l){if(!ql(s))throw Error(t(200));return Kl(null,n,s,!0,l)},Yn.hydrateRoot=function(n,s,l){if(!wh(n))throw Error(t(405));var h=l!=null&&l.hydratedSources||null,p=!1,x="",E=rg;if(l!=null&&(l.unstable_strictMode===!0&&(p=!0),l.identifierPrefix!==void 0&&(x=l.identifierPrefix),l.onRecoverableError!==void 0&&(E=l.onRecoverableError)),s=ng(s,null,n,1,l??null,p,!1,x,E),n[Zi]=s.current,ea(n),h)for(n=0;n<h.length;n++)l=h[n],p=l._getVersion,p=p(l._source),s.mutableSourceEagerHydrationData==null?s.mutableSourceEagerHydrationData=[l,p]:s.mutableSourceEagerHydrationData.push(l,p);return new Yl(s)},Yn.render=function(n,s,l){if(!ql(s))throw Error(t(200));return Kl(null,n,s,!1,l)},Yn.unmountComponentAtNode=function(n){if(!ql(n))throw Error(t(40));return n._reactRootContainer?(as(function(){Kl(null,null,n,!1,function(){n._reactRootContainer=null,n[Zi]=null})}),!0):!1},Yn.unstable_batchedUpdates=ph,Yn.unstable_renderSubtreeIntoContainer=function(n,s,l,h){if(!ql(l))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Kl(n,s,l,!1,h)},Yn.version="18.3.1-next-f1338f8080-20240426",Yn}var dg;function ny(){if(dg)return Ah.exports;dg=1;function i(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i)}catch(e){console.error(e)}}return i(),Ah.exports=ty(),Ah.exports}var pg;function iy(){if(pg)return Zl;pg=1;var i=ny();return Zl.createRoot=i.createRoot,Zl.hydrateRoot=i.hydrateRoot,Zl}var ry=iy();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const xd="170",sy=0,mg=1,oy=2,av=1,lv=2,ur=3,$r=0,On=1,gi=2,qr=0,So=1,Mo=2,gg=3,vg=4,ay=5,ys=100,ly=101,cy=102,uy=103,hy=104,fy=200,dy=201,py=202,my=203,wf=204,Ef=205,gy=206,vy=207,_y=208,xy=209,yy=210,Sy=211,My=212,wy=213,Ey=214,Tf=0,Af=1,Cf=2,Co=3,Rf=4,Pf=5,bf=6,Lf=7,cv=0,Ty=1,Ay=2,Kr=0,Cy=1,Ry=2,Py=3,by=4,Ly=5,Dy=6,Iy=7,uv=300,Ro=301,Po=302,Df=303,If=304,Bc=306,Oa=1e3,Ms=1001,Nf=1002,ii=1003,Ny=1004,Ql=1005,Wi=1006,Ph=1007,ws=1008,gr=1009,hv=1010,fv=1011,ka=1012,yd=1013,Es=1014,Xi=1015,Wa=1016,Sd=1017,Md=1018,bo=1020,dv=35902,pv=1021,mv=1022,Li=1023,gv=1024,vv=1025,wo=1026,Lo=1027,wd=1028,Ed=1029,_v=1030,Td=1031,Ad=1033,Lc=33776,Dc=33777,Ic=33778,Nc=33779,Uf=35840,Ff=35841,Of=35842,kf=35843,zf=36196,Bf=37492,Hf=37496,Vf=37808,Gf=37809,Wf=37810,Xf=37811,jf=37812,Yf=37813,qf=37814,Kf=37815,$f=37816,Zf=37817,Qf=37818,Jf=37819,ed=37820,td=37821,Uc=36492,nd=36494,id=36495,xv=36283,rd=36284,sd=36285,od=36286,Uy=3200,Fy=3201,yv=0,Oy=1,jr="",gn="srgb",Uo="srgb-linear",Hc="linear",Nt="srgb",Js=7680,_g=519,ky=512,zy=513,By=514,Sv=515,Hy=516,Vy=517,Gy=518,Wy=519,xg=35044,yg="300 es",dr=2e3,Oc=2001;class Fo{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const r=this._listeners;return r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const o=this._listeners[e];if(o!==void 0){const a=o.indexOf(t);a!==-1&&o.splice(a,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const r=this._listeners[e.type];if(r!==void 0){e.target=this;const o=r.slice(0);for(let a=0,c=o.length;a<c;a++)o[a].call(this,e);e.target=null}}}const Tn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Sg=1234567;const ba=Math.PI/180,za=180/Math.PI;function Cs(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Tn[i&255]+Tn[i>>8&255]+Tn[i>>16&255]+Tn[i>>24&255]+"-"+Tn[e&255]+Tn[e>>8&255]+"-"+Tn[e>>16&15|64]+Tn[e>>24&255]+"-"+Tn[t&63|128]+Tn[t>>8&255]+"-"+Tn[t>>16&255]+Tn[t>>24&255]+Tn[r&255]+Tn[r>>8&255]+Tn[r>>16&255]+Tn[r>>24&255]).toLowerCase()}function vn(i,e,t){return Math.max(e,Math.min(t,i))}function Cd(i,e){return(i%e+e)%e}function Xy(i,e,t,r,o){return r+(i-e)*(o-r)/(t-e)}function jy(i,e,t){return i!==e?(t-i)/(e-i):0}function La(i,e,t){return(1-t)*i+t*e}function Yy(i,e,t,r){return La(i,e,1-Math.exp(-t*r))}function qy(i,e=1){return e-Math.abs(Cd(i,e*2)-e)}function Ky(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function $y(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Zy(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Qy(i,e){return i+Math.random()*(e-i)}function Jy(i){return i*(.5-Math.random())}function eS(i){i!==void 0&&(Sg=i);let e=Sg+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function tS(i){return i*ba}function nS(i){return i*za}function iS(i){return(i&i-1)===0&&i!==0}function rS(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function sS(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function oS(i,e,t,r,o){const a=Math.cos,c=Math.sin,u=a(t/2),f=c(t/2),d=a((e+r)/2),m=c((e+r)/2),g=a((e-r)/2),v=c((e-r)/2),S=a((r-e)/2),M=c((r-e)/2);switch(o){case"XYX":i.set(u*m,f*g,f*v,u*d);break;case"YZY":i.set(f*v,u*m,f*g,u*d);break;case"ZXZ":i.set(f*g,f*v,u*m,u*d);break;case"XZX":i.set(u*m,f*M,f*S,u*d);break;case"YXY":i.set(f*S,u*m,f*M,u*d);break;case"ZYZ":i.set(f*M,f*S,u*m,u*d);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+o)}}function _o(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Nn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const pr={DEG2RAD:ba,RAD2DEG:za,generateUUID:Cs,clamp:vn,euclideanModulo:Cd,mapLinear:Xy,inverseLerp:jy,lerp:La,damp:Yy,pingpong:qy,smoothstep:Ky,smootherstep:$y,randInt:Zy,randFloat:Qy,randFloatSpread:Jy,seededRandom:eS,degToRad:tS,radToDeg:nS,isPowerOfTwo:iS,ceilPowerOfTwo:rS,floorPowerOfTwo:sS,setQuaternionFromProperEuler:oS,normalize:Nn,denormalize:_o};class ze{constructor(e=0,t=0){ze.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,o=e.elements;return this.x=o[0]*t+o[3]*r+o[6],this.y=o[1]*t+o[4]*r+o[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(vn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),o=Math.sin(t),a=this.x-e.x,c=this.y-e.y;return this.x=a*r-c*o+e.x,this.y=a*o+c*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class gt{constructor(e,t,r,o,a,c,u,f,d){gt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,o,a,c,u,f,d)}set(e,t,r,o,a,c,u,f,d){const m=this.elements;return m[0]=e,m[1]=o,m[2]=u,m[3]=t,m[4]=a,m[5]=f,m[6]=r,m[7]=c,m[8]=d,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,o=t.elements,a=this.elements,c=r[0],u=r[3],f=r[6],d=r[1],m=r[4],g=r[7],v=r[2],S=r[5],M=r[8],w=o[0],y=o[3],_=o[6],L=o[1],P=o[4],T=o[7],V=o[2],I=o[5],N=o[8];return a[0]=c*w+u*L+f*V,a[3]=c*y+u*P+f*I,a[6]=c*_+u*T+f*N,a[1]=d*w+m*L+g*V,a[4]=d*y+m*P+g*I,a[7]=d*_+m*T+g*N,a[2]=v*w+S*L+M*V,a[5]=v*y+S*P+M*I,a[8]=v*_+S*T+M*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],o=e[2],a=e[3],c=e[4],u=e[5],f=e[6],d=e[7],m=e[8];return t*c*m-t*u*d-r*a*m+r*u*f+o*a*d-o*c*f}invert(){const e=this.elements,t=e[0],r=e[1],o=e[2],a=e[3],c=e[4],u=e[5],f=e[6],d=e[7],m=e[8],g=m*c-u*d,v=u*f-m*a,S=d*a-c*f,M=t*g+r*v+o*S;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const w=1/M;return e[0]=g*w,e[1]=(o*d-m*r)*w,e[2]=(u*r-o*c)*w,e[3]=v*w,e[4]=(m*t-o*f)*w,e[5]=(o*a-u*t)*w,e[6]=S*w,e[7]=(r*f-d*t)*w,e[8]=(c*t-r*a)*w,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,o,a,c,u){const f=Math.cos(a),d=Math.sin(a);return this.set(r*f,r*d,-r*(f*c+d*u)+c+e,-o*d,o*f,-o*(-d*c+f*u)+u+t,0,0,1),this}scale(e,t){return this.premultiply(bh.makeScale(e,t)),this}rotate(e){return this.premultiply(bh.makeRotation(-e)),this}translate(e,t){return this.premultiply(bh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let o=0;o<9;o++)if(t[o]!==r[o])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const bh=new gt;function Mv(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function kc(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function aS(){const i=kc("canvas");return i.style.display="block",i}const Mg={};function Ra(i){i in Mg||(Mg[i]=!0,console.warn(i))}function lS(i,e,t){return new Promise(function(r,o){function a(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:o();break;case i.TIMEOUT_EXPIRED:setTimeout(a,t);break;default:r()}}setTimeout(a,t)})}function cS(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function uS(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const At={enabled:!0,workingColorSpace:Uo,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Nt&&(i.r=mr(i.r),i.g=mr(i.g),i.b=mr(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Nt&&(i.r=Eo(i.r),i.g=Eo(i.g),i.b=Eo(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===jr?Hc:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function mr(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Eo(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const wg=[.64,.33,.3,.6,.15,.06],Eg=[.2126,.7152,.0722],Tg=[.3127,.329],Ag=new gt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Cg=new gt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);At.define({[Uo]:{primaries:wg,whitePoint:Tg,transfer:Hc,toXYZ:Ag,fromXYZ:Cg,luminanceCoefficients:Eg,workingColorSpaceConfig:{unpackColorSpace:gn},outputColorSpaceConfig:{drawingBufferColorSpace:gn}},[gn]:{primaries:wg,whitePoint:Tg,transfer:Nt,toXYZ:Ag,fromXYZ:Cg,luminanceCoefficients:Eg,outputColorSpaceConfig:{drawingBufferColorSpace:gn}}});let eo;class hS{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{eo===void 0&&(eo=kc("canvas")),eo.width=e.width,eo.height=e.height;const r=eo.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),t=eo}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=kc("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const o=r.getImageData(0,0,e.width,e.height),a=o.data;for(let c=0;c<a.length;c++)a[c]=mr(a[c]/255)*255;return r.putImageData(o,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(mr(t[r]/255)*255):t[r]=mr(t[r]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let fS=0;class wv{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:fS++}),this.uuid=Cs(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},o=this.data;if(o!==null){let a;if(Array.isArray(o)){a=[];for(let c=0,u=o.length;c<u;c++)o[c].isDataTexture?a.push(Lh(o[c].image)):a.push(Lh(o[c]))}else a=Lh(o);r.url=a}return t||(e.images[this.uuid]=r),r}}function Lh(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?hS.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let dS=0;class Rn extends Fo{constructor(e=Rn.DEFAULT_IMAGE,t=Rn.DEFAULT_MAPPING,r=Ms,o=Ms,a=Wi,c=ws,u=Li,f=gr,d=Rn.DEFAULT_ANISOTROPY,m=jr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dS++}),this.uuid=Cs(),this.name="",this.source=new wv(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=o,this.magFilter=a,this.minFilter=c,this.anisotropy=d,this.format=u,this.internalFormat=null,this.type=f,this.offset=new ze(0,0),this.repeat=new ze(1,1),this.center=new ze(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new gt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==uv)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Oa:e.x=e.x-Math.floor(e.x);break;case Ms:e.x=e.x<0?0:1;break;case Nf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Oa:e.y=e.y-Math.floor(e.y);break;case Ms:e.y=e.y<0?0:1;break;case Nf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Rn.DEFAULT_IMAGE=null;Rn.DEFAULT_MAPPING=uv;Rn.DEFAULT_ANISOTROPY=1;class jt{constructor(e=0,t=0,r=0,o=1){jt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=r,this.w=o}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,o){return this.x=e,this.y=t,this.z=r,this.w=o,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,o=this.z,a=this.w,c=e.elements;return this.x=c[0]*t+c[4]*r+c[8]*o+c[12]*a,this.y=c[1]*t+c[5]*r+c[9]*o+c[13]*a,this.z=c[2]*t+c[6]*r+c[10]*o+c[14]*a,this.w=c[3]*t+c[7]*r+c[11]*o+c[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,o,a;const f=e.elements,d=f[0],m=f[4],g=f[8],v=f[1],S=f[5],M=f[9],w=f[2],y=f[6],_=f[10];if(Math.abs(m-v)<.01&&Math.abs(g-w)<.01&&Math.abs(M-y)<.01){if(Math.abs(m+v)<.1&&Math.abs(g+w)<.1&&Math.abs(M+y)<.1&&Math.abs(d+S+_-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const P=(d+1)/2,T=(S+1)/2,V=(_+1)/2,I=(m+v)/4,N=(g+w)/4,z=(M+y)/4;return P>T&&P>V?P<.01?(r=0,o=.707106781,a=.707106781):(r=Math.sqrt(P),o=I/r,a=N/r):T>V?T<.01?(r=.707106781,o=0,a=.707106781):(o=Math.sqrt(T),r=I/o,a=z/o):V<.01?(r=.707106781,o=.707106781,a=0):(a=Math.sqrt(V),r=N/a,o=z/a),this.set(r,o,a,t),this}let L=Math.sqrt((y-M)*(y-M)+(g-w)*(g-w)+(v-m)*(v-m));return Math.abs(L)<.001&&(L=1),this.x=(y-M)/L,this.y=(g-w)/L,this.z=(v-m)/L,this.w=Math.acos((d+S+_-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class pS extends Fo{constructor(e=1,t=1,r={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new jt(0,0,e,t),this.scissorTest=!1,this.viewport=new jt(0,0,e,t);const o={width:e,height:t,depth:1};r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Wi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},r);const a=new Rn(o,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace);a.flipY=!1,a.generateMipmaps=r.generateMipmaps,a.internalFormat=r.internalFormat,this.textures=[];const c=r.count;for(let u=0;u<c;u++)this.textures[u]=a.clone(),this.textures[u].isRenderTargetTexture=!0;this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this.depthTexture=r.depthTexture,this.samples=r.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let o=0,a=this.textures.length;o<a;o++)this.textures[o].image.width=e,this.textures[o].image.height=t,this.textures[o].image.depth=r;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let r=0,o=e.textures.length;r<o;r++)this.textures[r]=e.textures[r].clone(),this.textures[r].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new wv(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ts extends pS{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class Ev extends Rn{constructor(e=null,t=1,r=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:o},this.magFilter=ii,this.minFilter=ii,this.wrapR=Ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class mS extends Rn{constructor(e=null,t=1,r=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:o},this.magFilter=ii,this.minFilter=ii,this.wrapR=Ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class kn{constructor(e=0,t=0,r=0,o=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=o}static slerpFlat(e,t,r,o,a,c,u){let f=r[o+0],d=r[o+1],m=r[o+2],g=r[o+3];const v=a[c+0],S=a[c+1],M=a[c+2],w=a[c+3];if(u===0){e[t+0]=f,e[t+1]=d,e[t+2]=m,e[t+3]=g;return}if(u===1){e[t+0]=v,e[t+1]=S,e[t+2]=M,e[t+3]=w;return}if(g!==w||f!==v||d!==S||m!==M){let y=1-u;const _=f*v+d*S+m*M+g*w,L=_>=0?1:-1,P=1-_*_;if(P>Number.EPSILON){const V=Math.sqrt(P),I=Math.atan2(V,_*L);y=Math.sin(y*I)/V,u=Math.sin(u*I)/V}const T=u*L;if(f=f*y+v*T,d=d*y+S*T,m=m*y+M*T,g=g*y+w*T,y===1-u){const V=1/Math.sqrt(f*f+d*d+m*m+g*g);f*=V,d*=V,m*=V,g*=V}}e[t]=f,e[t+1]=d,e[t+2]=m,e[t+3]=g}static multiplyQuaternionsFlat(e,t,r,o,a,c){const u=r[o],f=r[o+1],d=r[o+2],m=r[o+3],g=a[c],v=a[c+1],S=a[c+2],M=a[c+3];return e[t]=u*M+m*g+f*S-d*v,e[t+1]=f*M+m*v+d*g-u*S,e[t+2]=d*M+m*S+u*v-f*g,e[t+3]=m*M-u*g-f*v-d*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,o){return this._x=e,this._y=t,this._z=r,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const r=e._x,o=e._y,a=e._z,c=e._order,u=Math.cos,f=Math.sin,d=u(r/2),m=u(o/2),g=u(a/2),v=f(r/2),S=f(o/2),M=f(a/2);switch(c){case"XYZ":this._x=v*m*g+d*S*M,this._y=d*S*g-v*m*M,this._z=d*m*M+v*S*g,this._w=d*m*g-v*S*M;break;case"YXZ":this._x=v*m*g+d*S*M,this._y=d*S*g-v*m*M,this._z=d*m*M-v*S*g,this._w=d*m*g+v*S*M;break;case"ZXY":this._x=v*m*g-d*S*M,this._y=d*S*g+v*m*M,this._z=d*m*M+v*S*g,this._w=d*m*g-v*S*M;break;case"ZYX":this._x=v*m*g-d*S*M,this._y=d*S*g+v*m*M,this._z=d*m*M-v*S*g,this._w=d*m*g+v*S*M;break;case"YZX":this._x=v*m*g+d*S*M,this._y=d*S*g+v*m*M,this._z=d*m*M-v*S*g,this._w=d*m*g-v*S*M;break;case"XZY":this._x=v*m*g-d*S*M,this._y=d*S*g-v*m*M,this._z=d*m*M+v*S*g,this._w=d*m*g+v*S*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,o=Math.sin(r);return this._x=e.x*o,this._y=e.y*o,this._z=e.z*o,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],o=t[4],a=t[8],c=t[1],u=t[5],f=t[9],d=t[2],m=t[6],g=t[10],v=r+u+g;if(v>0){const S=.5/Math.sqrt(v+1);this._w=.25/S,this._x=(m-f)*S,this._y=(a-d)*S,this._z=(c-o)*S}else if(r>u&&r>g){const S=2*Math.sqrt(1+r-u-g);this._w=(m-f)/S,this._x=.25*S,this._y=(o+c)/S,this._z=(a+d)/S}else if(u>g){const S=2*Math.sqrt(1+u-r-g);this._w=(a-d)/S,this._x=(o+c)/S,this._y=.25*S,this._z=(f+m)/S}else{const S=2*Math.sqrt(1+g-r-u);this._w=(c-o)/S,this._x=(a+d)/S,this._y=(f+m)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<Number.EPSILON?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(vn(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const o=Math.min(1,t/r);return this.slerp(e,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,o=e._y,a=e._z,c=e._w,u=t._x,f=t._y,d=t._z,m=t._w;return this._x=r*m+c*u+o*d-a*f,this._y=o*m+c*f+a*u-r*d,this._z=a*m+c*d+r*f-o*u,this._w=c*m-r*u-o*f-a*d,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const r=this._x,o=this._y,a=this._z,c=this._w;let u=c*e._w+r*e._x+o*e._y+a*e._z;if(u<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,u=-u):this.copy(e),u>=1)return this._w=c,this._x=r,this._y=o,this._z=a,this;const f=1-u*u;if(f<=Number.EPSILON){const S=1-t;return this._w=S*c+t*this._w,this._x=S*r+t*this._x,this._y=S*o+t*this._y,this._z=S*a+t*this._z,this.normalize(),this}const d=Math.sqrt(f),m=Math.atan2(d,u),g=Math.sin((1-t)*m)/d,v=Math.sin(t*m)/d;return this._w=c*g+this._w*v,this._x=r*g+this._x*v,this._y=o*g+this._y*v,this._z=a*g+this._z*v,this._onChangeCallback(),this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),o=Math.sqrt(1-r),a=Math.sqrt(r);return this.set(o*Math.sin(e),o*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class B{constructor(e=0,t=0,r=0){B.prototype.isVector3=!0,this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Rg.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Rg.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,o=this.z,a=e.elements;return this.x=a[0]*t+a[3]*r+a[6]*o,this.y=a[1]*t+a[4]*r+a[7]*o,this.z=a[2]*t+a[5]*r+a[8]*o,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,o=this.z,a=e.elements,c=1/(a[3]*t+a[7]*r+a[11]*o+a[15]);return this.x=(a[0]*t+a[4]*r+a[8]*o+a[12])*c,this.y=(a[1]*t+a[5]*r+a[9]*o+a[13])*c,this.z=(a[2]*t+a[6]*r+a[10]*o+a[14])*c,this}applyQuaternion(e){const t=this.x,r=this.y,o=this.z,a=e.x,c=e.y,u=e.z,f=e.w,d=2*(c*o-u*r),m=2*(u*t-a*o),g=2*(a*r-c*t);return this.x=t+f*d+c*g-u*m,this.y=r+f*m+u*d-a*g,this.z=o+f*g+a*m-c*d,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,o=this.z,a=e.elements;return this.x=a[0]*t+a[4]*r+a[8]*o,this.y=a[1]*t+a[5]*r+a[9]*o,this.z=a[2]*t+a[6]*r+a[10]*o,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,o=e.y,a=e.z,c=t.x,u=t.y,f=t.z;return this.x=o*f-a*u,this.y=a*c-r*f,this.z=r*u-o*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return Dh.copy(this).projectOnVector(e),this.sub(Dh)}reflect(e){return this.sub(Dh.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(vn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,o=this.z-e.z;return t*t+r*r+o*o}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const o=Math.sin(t)*e;return this.x=o*Math.sin(r),this.y=Math.cos(t)*e,this.z=o*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),o=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=o,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,r=Math.sqrt(1-t*t);return this.x=r*Math.cos(e),this.y=t,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Dh=new B,Rg=new kn;class Rs{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(Ci.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(Ci.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=Ci.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const a=r.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let c=0,u=a.count;c<u;c++)e.isMesh===!0?e.getVertexPosition(c,Ci):Ci.fromBufferAttribute(a,c),Ci.applyMatrix4(e.matrixWorld),this.expandByPoint(Ci);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Jl.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),Jl.copy(r.boundingBox)),Jl.applyMatrix4(e.matrixWorld),this.union(Jl)}const o=e.children;for(let a=0,c=o.length;a<c;a++)this.expandByObject(o[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ci),Ci.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(xa),ec.subVectors(this.max,xa),to.subVectors(e.a,xa),no.subVectors(e.b,xa),io.subVectors(e.c,xa),zr.subVectors(no,to),Br.subVectors(io,no),hs.subVectors(to,io);let t=[0,-zr.z,zr.y,0,-Br.z,Br.y,0,-hs.z,hs.y,zr.z,0,-zr.x,Br.z,0,-Br.x,hs.z,0,-hs.x,-zr.y,zr.x,0,-Br.y,Br.x,0,-hs.y,hs.x,0];return!Ih(t,to,no,io,ec)||(t=[1,0,0,0,1,0,0,0,1],!Ih(t,to,no,io,ec))?!1:(tc.crossVectors(zr,Br),t=[tc.x,tc.y,tc.z],Ih(t,to,no,io,ec))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ci).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ci).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(sr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),sr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),sr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),sr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),sr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),sr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),sr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),sr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(sr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const sr=[new B,new B,new B,new B,new B,new B,new B,new B],Ci=new B,Jl=new Rs,to=new B,no=new B,io=new B,zr=new B,Br=new B,hs=new B,xa=new B,ec=new B,tc=new B,fs=new B;function Ih(i,e,t,r,o){for(let a=0,c=i.length-3;a<=c;a+=3){fs.fromArray(i,a);const u=o.x*Math.abs(fs.x)+o.y*Math.abs(fs.y)+o.z*Math.abs(fs.z),f=e.dot(fs),d=t.dot(fs),m=r.dot(fs);if(Math.max(-Math.max(f,d,m),Math.min(f,d,m))>u)return!1}return!0}const gS=new Rs,ya=new B,Nh=new B;class Oo{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):gS.setFromPoints(e).getCenter(r);let o=0;for(let a=0,c=e.length;a<c;a++)o=Math.max(o,r.distanceToSquared(e[a]));return this.radius=Math.sqrt(o),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ya.subVectors(e,this.center);const t=ya.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),o=(r-this.radius)*.5;this.center.addScaledVector(ya,o/r),this.radius+=o}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Nh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ya.copy(e.center).add(Nh)),this.expandByPoint(ya.copy(e.center).sub(Nh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const or=new B,Uh=new B,nc=new B,Hr=new B,Fh=new B,ic=new B,Oh=new B;class Tv{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,or)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=or.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(or.copy(this.origin).addScaledVector(this.direction,t),or.distanceToSquared(e))}distanceSqToSegment(e,t,r,o){Uh.copy(e).add(t).multiplyScalar(.5),nc.copy(t).sub(e).normalize(),Hr.copy(this.origin).sub(Uh);const a=e.distanceTo(t)*.5,c=-this.direction.dot(nc),u=Hr.dot(this.direction),f=-Hr.dot(nc),d=Hr.lengthSq(),m=Math.abs(1-c*c);let g,v,S,M;if(m>0)if(g=c*f-u,v=c*u-f,M=a*m,g>=0)if(v>=-M)if(v<=M){const w=1/m;g*=w,v*=w,S=g*(g+c*v+2*u)+v*(c*g+v+2*f)+d}else v=a,g=Math.max(0,-(c*v+u)),S=-g*g+v*(v+2*f)+d;else v=-a,g=Math.max(0,-(c*v+u)),S=-g*g+v*(v+2*f)+d;else v<=-M?(g=Math.max(0,-(-c*a+u)),v=g>0?-a:Math.min(Math.max(-a,-f),a),S=-g*g+v*(v+2*f)+d):v<=M?(g=0,v=Math.min(Math.max(-a,-f),a),S=v*(v+2*f)+d):(g=Math.max(0,-(c*a+u)),v=g>0?a:Math.min(Math.max(-a,-f),a),S=-g*g+v*(v+2*f)+d);else v=c>0?-a:a,g=Math.max(0,-(c*v+u)),S=-g*g+v*(v+2*f)+d;return r&&r.copy(this.origin).addScaledVector(this.direction,g),o&&o.copy(Uh).addScaledVector(nc,v),S}intersectSphere(e,t){or.subVectors(e.center,this.origin);const r=or.dot(this.direction),o=or.dot(or)-r*r,a=e.radius*e.radius;if(o>a)return null;const c=Math.sqrt(a-o),u=r-c,f=r+c;return f<0?null:u<0?this.at(f,t):this.at(u,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,o,a,c,u,f;const d=1/this.direction.x,m=1/this.direction.y,g=1/this.direction.z,v=this.origin;return d>=0?(r=(e.min.x-v.x)*d,o=(e.max.x-v.x)*d):(r=(e.max.x-v.x)*d,o=(e.min.x-v.x)*d),m>=0?(a=(e.min.y-v.y)*m,c=(e.max.y-v.y)*m):(a=(e.max.y-v.y)*m,c=(e.min.y-v.y)*m),r>c||a>o||((a>r||isNaN(r))&&(r=a),(c<o||isNaN(o))&&(o=c),g>=0?(u=(e.min.z-v.z)*g,f=(e.max.z-v.z)*g):(u=(e.max.z-v.z)*g,f=(e.min.z-v.z)*g),r>f||u>o)||((u>r||r!==r)&&(r=u),(f<o||o!==o)&&(o=f),o<0)?null:this.at(r>=0?r:o,t)}intersectsBox(e){return this.intersectBox(e,or)!==null}intersectTriangle(e,t,r,o,a){Fh.subVectors(t,e),ic.subVectors(r,e),Oh.crossVectors(Fh,ic);let c=this.direction.dot(Oh),u;if(c>0){if(o)return null;u=1}else if(c<0)u=-1,c=-c;else return null;Hr.subVectors(this.origin,e);const f=u*this.direction.dot(ic.crossVectors(Hr,ic));if(f<0)return null;const d=u*this.direction.dot(Fh.cross(Hr));if(d<0||f+d>c)return null;const m=-u*Hr.dot(Oh);return m<0?null:this.at(m/c,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class It{constructor(e,t,r,o,a,c,u,f,d,m,g,v,S,M,w,y){It.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,o,a,c,u,f,d,m,g,v,S,M,w,y)}set(e,t,r,o,a,c,u,f,d,m,g,v,S,M,w,y){const _=this.elements;return _[0]=e,_[4]=t,_[8]=r,_[12]=o,_[1]=a,_[5]=c,_[9]=u,_[13]=f,_[2]=d,_[6]=m,_[10]=g,_[14]=v,_[3]=S,_[7]=M,_[11]=w,_[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new It().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,r=e.elements,o=1/ro.setFromMatrixColumn(e,0).length(),a=1/ro.setFromMatrixColumn(e,1).length(),c=1/ro.setFromMatrixColumn(e,2).length();return t[0]=r[0]*o,t[1]=r[1]*o,t[2]=r[2]*o,t[3]=0,t[4]=r[4]*a,t[5]=r[5]*a,t[6]=r[6]*a,t[7]=0,t[8]=r[8]*c,t[9]=r[9]*c,t[10]=r[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,o=e.y,a=e.z,c=Math.cos(r),u=Math.sin(r),f=Math.cos(o),d=Math.sin(o),m=Math.cos(a),g=Math.sin(a);if(e.order==="XYZ"){const v=c*m,S=c*g,M=u*m,w=u*g;t[0]=f*m,t[4]=-f*g,t[8]=d,t[1]=S+M*d,t[5]=v-w*d,t[9]=-u*f,t[2]=w-v*d,t[6]=M+S*d,t[10]=c*f}else if(e.order==="YXZ"){const v=f*m,S=f*g,M=d*m,w=d*g;t[0]=v+w*u,t[4]=M*u-S,t[8]=c*d,t[1]=c*g,t[5]=c*m,t[9]=-u,t[2]=S*u-M,t[6]=w+v*u,t[10]=c*f}else if(e.order==="ZXY"){const v=f*m,S=f*g,M=d*m,w=d*g;t[0]=v-w*u,t[4]=-c*g,t[8]=M+S*u,t[1]=S+M*u,t[5]=c*m,t[9]=w-v*u,t[2]=-c*d,t[6]=u,t[10]=c*f}else if(e.order==="ZYX"){const v=c*m,S=c*g,M=u*m,w=u*g;t[0]=f*m,t[4]=M*d-S,t[8]=v*d+w,t[1]=f*g,t[5]=w*d+v,t[9]=S*d-M,t[2]=-d,t[6]=u*f,t[10]=c*f}else if(e.order==="YZX"){const v=c*f,S=c*d,M=u*f,w=u*d;t[0]=f*m,t[4]=w-v*g,t[8]=M*g+S,t[1]=g,t[5]=c*m,t[9]=-u*m,t[2]=-d*m,t[6]=S*g+M,t[10]=v-w*g}else if(e.order==="XZY"){const v=c*f,S=c*d,M=u*f,w=u*d;t[0]=f*m,t[4]=-g,t[8]=d*m,t[1]=v*g+w,t[5]=c*m,t[9]=S*g-M,t[2]=M*g-S,t[6]=u*m,t[10]=w*g+v}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(vS,e,_S)}lookAt(e,t,r){const o=this.elements;return ti.subVectors(e,t),ti.lengthSq()===0&&(ti.z=1),ti.normalize(),Vr.crossVectors(r,ti),Vr.lengthSq()===0&&(Math.abs(r.z)===1?ti.x+=1e-4:ti.z+=1e-4,ti.normalize(),Vr.crossVectors(r,ti)),Vr.normalize(),rc.crossVectors(ti,Vr),o[0]=Vr.x,o[4]=rc.x,o[8]=ti.x,o[1]=Vr.y,o[5]=rc.y,o[9]=ti.y,o[2]=Vr.z,o[6]=rc.z,o[10]=ti.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,o=t.elements,a=this.elements,c=r[0],u=r[4],f=r[8],d=r[12],m=r[1],g=r[5],v=r[9],S=r[13],M=r[2],w=r[6],y=r[10],_=r[14],L=r[3],P=r[7],T=r[11],V=r[15],I=o[0],N=o[4],z=o[8],R=o[12],A=o[1],F=o[5],$=o[9],Y=o[13],ie=o[2],ce=o[6],oe=o[10],ue=o[14],G=o[3],he=o[7],ae=o[11],k=o[15];return a[0]=c*I+u*A+f*ie+d*G,a[4]=c*N+u*F+f*ce+d*he,a[8]=c*z+u*$+f*oe+d*ae,a[12]=c*R+u*Y+f*ue+d*k,a[1]=m*I+g*A+v*ie+S*G,a[5]=m*N+g*F+v*ce+S*he,a[9]=m*z+g*$+v*oe+S*ae,a[13]=m*R+g*Y+v*ue+S*k,a[2]=M*I+w*A+y*ie+_*G,a[6]=M*N+w*F+y*ce+_*he,a[10]=M*z+w*$+y*oe+_*ae,a[14]=M*R+w*Y+y*ue+_*k,a[3]=L*I+P*A+T*ie+V*G,a[7]=L*N+P*F+T*ce+V*he,a[11]=L*z+P*$+T*oe+V*ae,a[15]=L*R+P*Y+T*ue+V*k,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],o=e[8],a=e[12],c=e[1],u=e[5],f=e[9],d=e[13],m=e[2],g=e[6],v=e[10],S=e[14],M=e[3],w=e[7],y=e[11],_=e[15];return M*(+a*f*g-o*d*g-a*u*v+r*d*v+o*u*S-r*f*S)+w*(+t*f*S-t*d*v+a*c*v-o*c*S+o*d*m-a*f*m)+y*(+t*d*g-t*u*S-a*c*g+r*c*S+a*u*m-r*d*m)+_*(-o*u*m-t*f*g+t*u*v+o*c*g-r*c*v+r*f*m)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const o=this.elements;return e.isVector3?(o[12]=e.x,o[13]=e.y,o[14]=e.z):(o[12]=e,o[13]=t,o[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],o=e[2],a=e[3],c=e[4],u=e[5],f=e[6],d=e[7],m=e[8],g=e[9],v=e[10],S=e[11],M=e[12],w=e[13],y=e[14],_=e[15],L=g*y*d-w*v*d+w*f*S-u*y*S-g*f*_+u*v*_,P=M*v*d-m*y*d-M*f*S+c*y*S+m*f*_-c*v*_,T=m*w*d-M*g*d+M*u*S-c*w*S-m*u*_+c*g*_,V=M*g*f-m*w*f-M*u*v+c*w*v+m*u*y-c*g*y,I=t*L+r*P+o*T+a*V;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const N=1/I;return e[0]=L*N,e[1]=(w*v*a-g*y*a-w*o*S+r*y*S+g*o*_-r*v*_)*N,e[2]=(u*y*a-w*f*a+w*o*d-r*y*d-u*o*_+r*f*_)*N,e[3]=(g*f*a-u*v*a-g*o*d+r*v*d+u*o*S-r*f*S)*N,e[4]=P*N,e[5]=(m*y*a-M*v*a+M*o*S-t*y*S-m*o*_+t*v*_)*N,e[6]=(M*f*a-c*y*a-M*o*d+t*y*d+c*o*_-t*f*_)*N,e[7]=(c*v*a-m*f*a+m*o*d-t*v*d-c*o*S+t*f*S)*N,e[8]=T*N,e[9]=(M*g*a-m*w*a-M*r*S+t*w*S+m*r*_-t*g*_)*N,e[10]=(c*w*a-M*u*a+M*r*d-t*w*d-c*r*_+t*u*_)*N,e[11]=(m*u*a-c*g*a-m*r*d+t*g*d+c*r*S-t*u*S)*N,e[12]=V*N,e[13]=(m*w*o-M*g*o+M*r*v-t*w*v-m*r*y+t*g*y)*N,e[14]=(M*u*o-c*w*o-M*r*f+t*w*f+c*r*y-t*u*y)*N,e[15]=(c*g*o-m*u*o+m*r*f-t*g*f-c*r*v+t*u*v)*N,this}scale(e){const t=this.elements,r=e.x,o=e.y,a=e.z;return t[0]*=r,t[4]*=o,t[8]*=a,t[1]*=r,t[5]*=o,t[9]*=a,t[2]*=r,t[6]*=o,t[10]*=a,t[3]*=r,t[7]*=o,t[11]*=a,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],o=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,o))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),o=Math.sin(t),a=1-r,c=e.x,u=e.y,f=e.z,d=a*c,m=a*u;return this.set(d*c+r,d*u-o*f,d*f+o*u,0,d*u+o*f,m*u+r,m*f-o*c,0,d*f-o*u,m*f+o*c,a*f*f+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,o,a,c){return this.set(1,r,a,0,e,1,c,0,t,o,1,0,0,0,0,1),this}compose(e,t,r){const o=this.elements,a=t._x,c=t._y,u=t._z,f=t._w,d=a+a,m=c+c,g=u+u,v=a*d,S=a*m,M=a*g,w=c*m,y=c*g,_=u*g,L=f*d,P=f*m,T=f*g,V=r.x,I=r.y,N=r.z;return o[0]=(1-(w+_))*V,o[1]=(S+T)*V,o[2]=(M-P)*V,o[3]=0,o[4]=(S-T)*I,o[5]=(1-(v+_))*I,o[6]=(y+L)*I,o[7]=0,o[8]=(M+P)*N,o[9]=(y-L)*N,o[10]=(1-(v+w))*N,o[11]=0,o[12]=e.x,o[13]=e.y,o[14]=e.z,o[15]=1,this}decompose(e,t,r){const o=this.elements;let a=ro.set(o[0],o[1],o[2]).length();const c=ro.set(o[4],o[5],o[6]).length(),u=ro.set(o[8],o[9],o[10]).length();this.determinant()<0&&(a=-a),e.x=o[12],e.y=o[13],e.z=o[14],Ri.copy(this);const d=1/a,m=1/c,g=1/u;return Ri.elements[0]*=d,Ri.elements[1]*=d,Ri.elements[2]*=d,Ri.elements[4]*=m,Ri.elements[5]*=m,Ri.elements[6]*=m,Ri.elements[8]*=g,Ri.elements[9]*=g,Ri.elements[10]*=g,t.setFromRotationMatrix(Ri),r.x=a,r.y=c,r.z=u,this}makePerspective(e,t,r,o,a,c,u=dr){const f=this.elements,d=2*a/(t-e),m=2*a/(r-o),g=(t+e)/(t-e),v=(r+o)/(r-o);let S,M;if(u===dr)S=-(c+a)/(c-a),M=-2*c*a/(c-a);else if(u===Oc)S=-c/(c-a),M=-c*a/(c-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+u);return f[0]=d,f[4]=0,f[8]=g,f[12]=0,f[1]=0,f[5]=m,f[9]=v,f[13]=0,f[2]=0,f[6]=0,f[10]=S,f[14]=M,f[3]=0,f[7]=0,f[11]=-1,f[15]=0,this}makeOrthographic(e,t,r,o,a,c,u=dr){const f=this.elements,d=1/(t-e),m=1/(r-o),g=1/(c-a),v=(t+e)*d,S=(r+o)*m;let M,w;if(u===dr)M=(c+a)*g,w=-2*g;else if(u===Oc)M=a*g,w=-1*g;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+u);return f[0]=2*d,f[4]=0,f[8]=0,f[12]=-v,f[1]=0,f[5]=2*m,f[9]=0,f[13]=-S,f[2]=0,f[6]=0,f[10]=w,f[14]=-M,f[3]=0,f[7]=0,f[11]=0,f[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let o=0;o<16;o++)if(t[o]!==r[o])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}}const ro=new B,Ri=new It,vS=new B(0,0,0),_S=new B(1,1,1),Vr=new B,rc=new B,ti=new B,Pg=new It,bg=new kn;class vi{constructor(e=0,t=0,r=0,o=vi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=o}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,o=this._order){return this._x=e,this._y=t,this._z=r,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const o=e.elements,a=o[0],c=o[4],u=o[8],f=o[1],d=o[5],m=o[9],g=o[2],v=o[6],S=o[10];switch(t){case"XYZ":this._y=Math.asin(vn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-m,S),this._z=Math.atan2(-c,a)):(this._x=Math.atan2(v,d),this._z=0);break;case"YXZ":this._x=Math.asin(-vn(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(u,S),this._z=Math.atan2(f,d)):(this._y=Math.atan2(-g,a),this._z=0);break;case"ZXY":this._x=Math.asin(vn(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(-g,S),this._z=Math.atan2(-c,d)):(this._y=0,this._z=Math.atan2(f,a));break;case"ZYX":this._y=Math.asin(-vn(g,-1,1)),Math.abs(g)<.9999999?(this._x=Math.atan2(v,S),this._z=Math.atan2(f,a)):(this._x=0,this._z=Math.atan2(-c,d));break;case"YZX":this._z=Math.asin(vn(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(-m,d),this._y=Math.atan2(-g,a)):(this._x=0,this._y=Math.atan2(u,S));break;case"XZY":this._z=Math.asin(-vn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(v,d),this._y=Math.atan2(u,a)):(this._x=Math.atan2(-m,S),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return Pg.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Pg,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return bg.setFromEuler(this),this.setFromQuaternion(bg,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}vi.DEFAULT_ORDER="XYZ";class Av{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xS=0;const Lg=new B,so=new kn,ar=new It,sc=new B,Sa=new B,yS=new B,SS=new kn,Dg=new B(1,0,0),Ig=new B(0,1,0),Ng=new B(0,0,1),Ug={type:"added"},MS={type:"removed"},oo={type:"childadded",child:null},kh={type:"childremoved",child:null};class fn extends Fo{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xS++}),this.uuid=Cs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=fn.DEFAULT_UP.clone();const e=new B,t=new vi,r=new kn,o=new B(1,1,1);function a(){r.setFromEuler(t,!1)}function c(){t.setFromQuaternion(r,void 0,!1)}t._onChange(a),r._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new It},normalMatrix:{value:new gt}}),this.matrix=new It,this.matrixWorld=new It,this.matrixAutoUpdate=fn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=fn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Av,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return so.setFromAxisAngle(e,t),this.quaternion.multiply(so),this}rotateOnWorldAxis(e,t){return so.setFromAxisAngle(e,t),this.quaternion.premultiply(so),this}rotateX(e){return this.rotateOnAxis(Dg,e)}rotateY(e){return this.rotateOnAxis(Ig,e)}rotateZ(e){return this.rotateOnAxis(Ng,e)}translateOnAxis(e,t){return Lg.copy(e).applyQuaternion(this.quaternion),this.position.add(Lg.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Dg,e)}translateY(e){return this.translateOnAxis(Ig,e)}translateZ(e){return this.translateOnAxis(Ng,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ar.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?sc.copy(e):sc.set(e,t,r);const o=this.parent;this.updateWorldMatrix(!0,!1),Sa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ar.lookAt(Sa,sc,this.up):ar.lookAt(sc,Sa,this.up),this.quaternion.setFromRotationMatrix(ar),o&&(ar.extractRotation(o.matrixWorld),so.setFromRotationMatrix(ar),this.quaternion.premultiply(so.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ug),oo.child=e,this.dispatchEvent(oo),oo.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(MS),kh.child=e,this.dispatchEvent(kh),kh.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ar.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ar.multiply(e.parent.matrixWorld)),e.applyMatrix4(ar),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ug),oo.child=e,this.dispatchEvent(oo),oo.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,o=this.children.length;r<o;r++){const c=this.children[r].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const o=this.children;for(let a=0,c=o.length;a<c;a++)o[a].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sa,e,yS),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sa,SS,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].updateMatrixWorld(e)}updateWorldMatrix(e,t){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const o=this.children;for(let a=0,c=o.length;a<c;a++)o[a].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.visibility=this._visibility,o.active=this._active,o.bounds=this._bounds.map(u=>({boxInitialized:u.boxInitialized,boxMin:u.box.min.toArray(),boxMax:u.box.max.toArray(),sphereInitialized:u.sphereInitialized,sphereRadius:u.sphere.radius,sphereCenter:u.sphere.center.toArray()})),o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.geometryCount=this._geometryCount,o.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(o.boundingSphere={center:o.boundingSphere.center.toArray(),radius:o.boundingSphere.radius}),this.boundingBox!==null&&(o.boundingBox={min:o.boundingBox.min.toArray(),max:o.boundingBox.max.toArray()}));function a(u,f){return u[f.uuid]===void 0&&(u[f.uuid]=f.toJSON(e)),f.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=a(e.geometries,this.geometry);const u=this.geometry.parameters;if(u!==void 0&&u.shapes!==void 0){const f=u.shapes;if(Array.isArray(f))for(let d=0,m=f.length;d<m;d++){const g=f[d];a(e.shapes,g)}else a(e.shapes,f)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const u=[];for(let f=0,d=this.material.length;f<d;f++)u.push(a(e.materials,this.material[f]));o.material=u}else o.material=a(e.materials,this.material);if(this.children.length>0){o.children=[];for(let u=0;u<this.children.length;u++)o.children.push(this.children[u].toJSON(e).object)}if(this.animations.length>0){o.animations=[];for(let u=0;u<this.animations.length;u++){const f=this.animations[u];o.animations.push(a(e.animations,f))}}if(t){const u=c(e.geometries),f=c(e.materials),d=c(e.textures),m=c(e.images),g=c(e.shapes),v=c(e.skeletons),S=c(e.animations),M=c(e.nodes);u.length>0&&(r.geometries=u),f.length>0&&(r.materials=f),d.length>0&&(r.textures=d),m.length>0&&(r.images=m),g.length>0&&(r.shapes=g),v.length>0&&(r.skeletons=v),S.length>0&&(r.animations=S),M.length>0&&(r.nodes=M)}return r.object=o,r;function c(u){const f=[];for(const d in u){const m=u[d];delete m.metadata,f.push(m)}return f}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const o=e.children[r];this.add(o.clone())}return this}}fn.DEFAULT_UP=new B(0,1,0);fn.DEFAULT_MATRIX_AUTO_UPDATE=!0;fn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Pi=new B,lr=new B,zh=new B,cr=new B,ao=new B,lo=new B,Fg=new B,Bh=new B,Hh=new B,Vh=new B,Gh=new jt,Wh=new jt,Xh=new jt;class bi{constructor(e=new B,t=new B,r=new B){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,o){o.subVectors(r,t),Pi.subVectors(e,t),o.cross(Pi);const a=o.lengthSq();return a>0?o.multiplyScalar(1/Math.sqrt(a)):o.set(0,0,0)}static getBarycoord(e,t,r,o,a){Pi.subVectors(o,t),lr.subVectors(r,t),zh.subVectors(e,t);const c=Pi.dot(Pi),u=Pi.dot(lr),f=Pi.dot(zh),d=lr.dot(lr),m=lr.dot(zh),g=c*d-u*u;if(g===0)return a.set(0,0,0),null;const v=1/g,S=(d*f-u*m)*v,M=(c*m-u*f)*v;return a.set(1-S-M,M,S)}static containsPoint(e,t,r,o){return this.getBarycoord(e,t,r,o,cr)===null?!1:cr.x>=0&&cr.y>=0&&cr.x+cr.y<=1}static getInterpolation(e,t,r,o,a,c,u,f){return this.getBarycoord(e,t,r,o,cr)===null?(f.x=0,f.y=0,"z"in f&&(f.z=0),"w"in f&&(f.w=0),null):(f.setScalar(0),f.addScaledVector(a,cr.x),f.addScaledVector(c,cr.y),f.addScaledVector(u,cr.z),f)}static getInterpolatedAttribute(e,t,r,o,a,c){return Gh.setScalar(0),Wh.setScalar(0),Xh.setScalar(0),Gh.fromBufferAttribute(e,t),Wh.fromBufferAttribute(e,r),Xh.fromBufferAttribute(e,o),c.setScalar(0),c.addScaledVector(Gh,a.x),c.addScaledVector(Wh,a.y),c.addScaledVector(Xh,a.z),c}static isFrontFacing(e,t,r,o){return Pi.subVectors(r,t),lr.subVectors(e,t),Pi.cross(lr).dot(o)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,o){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[o]),this}setFromAttributeAndIndices(e,t,r,o){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,o),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Pi.subVectors(this.c,this.b),lr.subVectors(this.a,this.b),Pi.cross(lr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return bi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return bi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,r,o,a){return bi.getInterpolation(e,this.a,this.b,this.c,t,r,o,a)}containsPoint(e){return bi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return bi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,o=this.b,a=this.c;let c,u;ao.subVectors(o,r),lo.subVectors(a,r),Bh.subVectors(e,r);const f=ao.dot(Bh),d=lo.dot(Bh);if(f<=0&&d<=0)return t.copy(r);Hh.subVectors(e,o);const m=ao.dot(Hh),g=lo.dot(Hh);if(m>=0&&g<=m)return t.copy(o);const v=f*g-m*d;if(v<=0&&f>=0&&m<=0)return c=f/(f-m),t.copy(r).addScaledVector(ao,c);Vh.subVectors(e,a);const S=ao.dot(Vh),M=lo.dot(Vh);if(M>=0&&S<=M)return t.copy(a);const w=S*d-f*M;if(w<=0&&d>=0&&M<=0)return u=d/(d-M),t.copy(r).addScaledVector(lo,u);const y=m*M-S*g;if(y<=0&&g-m>=0&&S-M>=0)return Fg.subVectors(a,o),u=(g-m)/(g-m+(S-M)),t.copy(o).addScaledVector(Fg,u);const _=1/(y+w+v);return c=w*_,u=v*_,t.copy(r).addScaledVector(ao,c).addScaledVector(lo,u)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Cv={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gr={h:0,s:0,l:0},oc={h:0,s:0,l:0};function jh(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class ht{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const o=e;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=gn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,At.toWorkingColorSpace(this,t),this}setRGB(e,t,r,o=At.workingColorSpace){return this.r=e,this.g=t,this.b=r,At.toWorkingColorSpace(this,o),this}setHSL(e,t,r,o=At.workingColorSpace){if(e=Cd(e,1),t=vn(t,0,1),r=vn(r,0,1),t===0)this.r=this.g=this.b=r;else{const a=r<=.5?r*(1+t):r+t-r*t,c=2*r-a;this.r=jh(c,a,e+1/3),this.g=jh(c,a,e),this.b=jh(c,a,e-1/3)}return At.toWorkingColorSpace(this,o),this}setStyle(e,t=gn){function r(a){a!==void 0&&parseFloat(a)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(e)){let a;const c=o[1],u=o[2];switch(c){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return r(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return r(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return r(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(e)){const a=o[1],c=a.length;if(c===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(a,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=gn){const r=Cv[e.toLowerCase()];return r!==void 0?this.setHex(r,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=mr(e.r),this.g=mr(e.g),this.b=mr(e.b),this}copyLinearToSRGB(e){return this.r=Eo(e.r),this.g=Eo(e.g),this.b=Eo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=gn){return At.fromWorkingColorSpace(An.copy(this),e),Math.round(vn(An.r*255,0,255))*65536+Math.round(vn(An.g*255,0,255))*256+Math.round(vn(An.b*255,0,255))}getHexString(e=gn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=At.workingColorSpace){At.fromWorkingColorSpace(An.copy(this),t);const r=An.r,o=An.g,a=An.b,c=Math.max(r,o,a),u=Math.min(r,o,a);let f,d;const m=(u+c)/2;if(u===c)f=0,d=0;else{const g=c-u;switch(d=m<=.5?g/(c+u):g/(2-c-u),c){case r:f=(o-a)/g+(o<a?6:0);break;case o:f=(a-r)/g+2;break;case a:f=(r-o)/g+4;break}f/=6}return e.h=f,e.s=d,e.l=m,e}getRGB(e,t=At.workingColorSpace){return At.fromWorkingColorSpace(An.copy(this),t),e.r=An.r,e.g=An.g,e.b=An.b,e}getStyle(e=gn){At.fromWorkingColorSpace(An.copy(this),e);const t=An.r,r=An.g,o=An.b;return e!==gn?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(o*255)})`}offsetHSL(e,t,r){return this.getHSL(Gr),this.setHSL(Gr.h+e,Gr.s+t,Gr.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(Gr),e.getHSL(oc);const r=La(Gr.h,oc.h,t),o=La(Gr.s,oc.s,t),a=La(Gr.l,oc.l,t);return this.setHSL(r,o,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,o=this.b,a=e.elements;return this.r=a[0]*t+a[3]*r+a[6]*o,this.g=a[1]*t+a[4]*r+a[7]*o,this.b=a[2]*t+a[5]*r+a[8]*o,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const An=new ht;ht.NAMES=Cv;let wS=0;class ko extends Fo{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wS++}),this.uuid=Cs(),this.name="",this.blending=So,this.side=$r,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=wf,this.blendDst=Ef,this.blendEquation=ys,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ht(0,0,0),this.blendAlpha=0,this.depthFunc=Co,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_g,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Js,this.stencilZFail=Js,this.stencilZPass=Js,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const o=this[t];if(o===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(r):o&&o.isVector3&&r&&r.isVector3?o.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==So&&(r.blending=this.blending),this.side!==$r&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==wf&&(r.blendSrc=this.blendSrc),this.blendDst!==Ef&&(r.blendDst=this.blendDst),this.blendEquation!==ys&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==Co&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==_g&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Js&&(r.stencilFail=this.stencilFail),this.stencilZFail!==Js&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==Js&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function o(a){const c=[];for(const u in a){const f=a[u];delete f.metadata,c.push(f)}return c}if(t){const a=o(e.textures),c=o(e.images);a.length>0&&(r.textures=a),c.length>0&&(r.images=c)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const o=t.length;r=new Array(o);for(let a=0;a!==o;++a)r[a]=t[a].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class To extends ko{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new ht(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.combine=cv,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const $t=new B,ac=new ze;class ri{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=xg,this.updateRanges=[],this.gpuType=Xi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let o=0,a=this.itemSize;o<a;o++)this.array[e+o]=t.array[r+o];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)ac.fromBufferAttribute(this,t),ac.applyMatrix3(e),this.setXY(t,ac.x,ac.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix3(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=_o(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Nn(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=_o(t,this.array)),t}setX(e,t){return this.normalized&&(t=Nn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=_o(t,this.array)),t}setY(e,t){return this.normalized&&(t=Nn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=_o(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Nn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=_o(t,this.array)),t}setW(e,t){return this.normalized&&(t=Nn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=Nn(t,this.array),r=Nn(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,o){return e*=this.itemSize,this.normalized&&(t=Nn(t,this.array),r=Nn(r,this.array),o=Nn(o,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=o,this}setXYZW(e,t,r,o,a){return e*=this.itemSize,this.normalized&&(t=Nn(t,this.array),r=Nn(r,this.array),o=Nn(o,this.array),a=Nn(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=o,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==xg&&(e.usage=this.usage),e}}class Rv extends ri{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class Pv extends ri{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class zn extends ri{constructor(e,t,r){super(new Float32Array(e),t,r)}}let ES=0;const di=new It,Yh=new fn,co=new B,ni=new Rs,Ma=new Rs,un=new B;class _i extends Fo{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ES++}),this.uuid=Cs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Mv(e)?Pv:Rv)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const a=new gt().getNormalMatrix(e);r.applyNormalMatrix(a),r.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(e),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return di.makeRotationFromQuaternion(e),this.applyMatrix4(di),this}rotateX(e){return di.makeRotationX(e),this.applyMatrix4(di),this}rotateY(e){return di.makeRotationY(e),this.applyMatrix4(di),this}rotateZ(e){return di.makeRotationZ(e),this.applyMatrix4(di),this}translate(e,t,r){return di.makeTranslation(e,t,r),this.applyMatrix4(di),this}scale(e,t,r){return di.makeScale(e,t,r),this.applyMatrix4(di),this}lookAt(e){return Yh.lookAt(e),Yh.updateMatrix(),this.applyMatrix4(Yh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(co).negate(),this.translate(co.x,co.y,co.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const r=[];for(let o=0,a=e.length;o<a;o++){const c=e[o];r.push(c.x,c.y,c.z||0)}this.setAttribute("position",new zn(r,3))}else{for(let r=0,o=t.count;r<o;r++){const a=e[r];t.setXYZ(r,a.x,a.y,a.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Rs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];ni.setFromBufferAttribute(a),this.morphTargetsRelative?(un.addVectors(this.boundingBox.min,ni.min),this.boundingBox.expandByPoint(un),un.addVectors(this.boundingBox.max,ni.max),this.boundingBox.expandByPoint(un)):(this.boundingBox.expandByPoint(ni.min),this.boundingBox.expandByPoint(ni.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Oo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){const r=this.boundingSphere.center;if(ni.setFromBufferAttribute(e),t)for(let a=0,c=t.length;a<c;a++){const u=t[a];Ma.setFromBufferAttribute(u),this.morphTargetsRelative?(un.addVectors(ni.min,Ma.min),ni.expandByPoint(un),un.addVectors(ni.max,Ma.max),ni.expandByPoint(un)):(ni.expandByPoint(Ma.min),ni.expandByPoint(Ma.max))}ni.getCenter(r);let o=0;for(let a=0,c=e.count;a<c;a++)un.fromBufferAttribute(e,a),o=Math.max(o,r.distanceToSquared(un));if(t)for(let a=0,c=t.length;a<c;a++){const u=t[a],f=this.morphTargetsRelative;for(let d=0,m=u.count;d<m;d++)un.fromBufferAttribute(u,d),f&&(co.fromBufferAttribute(e,d),un.add(co)),o=Math.max(o,r.distanceToSquared(un))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=t.position,o=t.normal,a=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ri(new Float32Array(4*r.count),4));const c=this.getAttribute("tangent"),u=[],f=[];for(let z=0;z<r.count;z++)u[z]=new B,f[z]=new B;const d=new B,m=new B,g=new B,v=new ze,S=new ze,M=new ze,w=new B,y=new B;function _(z,R,A){d.fromBufferAttribute(r,z),m.fromBufferAttribute(r,R),g.fromBufferAttribute(r,A),v.fromBufferAttribute(a,z),S.fromBufferAttribute(a,R),M.fromBufferAttribute(a,A),m.sub(d),g.sub(d),S.sub(v),M.sub(v);const F=1/(S.x*M.y-M.x*S.y);isFinite(F)&&(w.copy(m).multiplyScalar(M.y).addScaledVector(g,-S.y).multiplyScalar(F),y.copy(g).multiplyScalar(S.x).addScaledVector(m,-M.x).multiplyScalar(F),u[z].add(w),u[R].add(w),u[A].add(w),f[z].add(y),f[R].add(y),f[A].add(y))}let L=this.groups;L.length===0&&(L=[{start:0,count:e.count}]);for(let z=0,R=L.length;z<R;++z){const A=L[z],F=A.start,$=A.count;for(let Y=F,ie=F+$;Y<ie;Y+=3)_(e.getX(Y+0),e.getX(Y+1),e.getX(Y+2))}const P=new B,T=new B,V=new B,I=new B;function N(z){V.fromBufferAttribute(o,z),I.copy(V);const R=u[z];P.copy(R),P.sub(V.multiplyScalar(V.dot(R))).normalize(),T.crossVectors(I,R);const F=T.dot(f[z])<0?-1:1;c.setXYZW(z,P.x,P.y,P.z,F)}for(let z=0,R=L.length;z<R;++z){const A=L[z],F=A.start,$=A.count;for(let Y=F,ie=F+$;Y<ie;Y+=3)N(e.getX(Y+0)),N(e.getX(Y+1)),N(e.getX(Y+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new ri(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let v=0,S=r.count;v<S;v++)r.setXYZ(v,0,0,0);const o=new B,a=new B,c=new B,u=new B,f=new B,d=new B,m=new B,g=new B;if(e)for(let v=0,S=e.count;v<S;v+=3){const M=e.getX(v+0),w=e.getX(v+1),y=e.getX(v+2);o.fromBufferAttribute(t,M),a.fromBufferAttribute(t,w),c.fromBufferAttribute(t,y),m.subVectors(c,a),g.subVectors(o,a),m.cross(g),u.fromBufferAttribute(r,M),f.fromBufferAttribute(r,w),d.fromBufferAttribute(r,y),u.add(m),f.add(m),d.add(m),r.setXYZ(M,u.x,u.y,u.z),r.setXYZ(w,f.x,f.y,f.z),r.setXYZ(y,d.x,d.y,d.z)}else for(let v=0,S=t.count;v<S;v+=3)o.fromBufferAttribute(t,v+0),a.fromBufferAttribute(t,v+1),c.fromBufferAttribute(t,v+2),m.subVectors(c,a),g.subVectors(o,a),m.cross(g),r.setXYZ(v+0,m.x,m.y,m.z),r.setXYZ(v+1,m.x,m.y,m.z),r.setXYZ(v+2,m.x,m.y,m.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)un.fromBufferAttribute(e,t),un.normalize(),e.setXYZ(t,un.x,un.y,un.z)}toNonIndexed(){function e(u,f){const d=u.array,m=u.itemSize,g=u.normalized,v=new d.constructor(f.length*m);let S=0,M=0;for(let w=0,y=f.length;w<y;w++){u.isInterleavedBufferAttribute?S=f[w]*u.data.stride+u.offset:S=f[w]*m;for(let _=0;_<m;_++)v[M++]=d[S++]}return new ri(v,m,g)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new _i,r=this.index.array,o=this.attributes;for(const u in o){const f=o[u],d=e(f,r);t.setAttribute(u,d)}const a=this.morphAttributes;for(const u in a){const f=[],d=a[u];for(let m=0,g=d.length;m<g;m++){const v=d[m],S=e(v,r);f.push(S)}t.morphAttributes[u]=f}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let u=0,f=c.length;u<f;u++){const d=c[u];t.addGroup(d.start,d.count,d.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const f=this.parameters;for(const d in f)f[d]!==void 0&&(e[d]=f[d]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const f in r){const d=r[f];e.data.attributes[f]=d.toJSON(e.data)}const o={};let a=!1;for(const f in this.morphAttributes){const d=this.morphAttributes[f],m=[];for(let g=0,v=d.length;g<v;g++){const S=d[g];m.push(S.toJSON(e.data))}m.length>0&&(o[f]=m,a=!0)}a&&(e.data.morphAttributes=o,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const u=this.boundingSphere;return u!==null&&(e.data.boundingSphere={center:u.center.toArray(),radius:u.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone(t));const o=e.attributes;for(const d in o){const m=o[d];this.setAttribute(d,m.clone(t))}const a=e.morphAttributes;for(const d in a){const m=[],g=a[d];for(let v=0,S=g.length;v<S;v++)m.push(g[v].clone(t));this.morphAttributes[d]=m}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let d=0,m=c.length;d<m;d++){const g=c[d];this.addGroup(g.start,g.count,g.materialIndex)}const u=e.boundingBox;u!==null&&(this.boundingBox=u.clone());const f=e.boundingSphere;return f!==null&&(this.boundingSphere=f.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Og=new It,ds=new Tv,lc=new Oo,kg=new B,cc=new B,uc=new B,hc=new B,qh=new B,fc=new B,zg=new B,dc=new B;class Pt extends fn{constructor(e=new _i,t=new To){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const o=t[r[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=o.length;a<c;a++){const u=o[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=a}}}}getVertexPosition(e,t){const r=this.geometry,o=r.attributes.position,a=r.morphAttributes.position,c=r.morphTargetsRelative;t.fromBufferAttribute(o,e);const u=this.morphTargetInfluences;if(a&&u){fc.set(0,0,0);for(let f=0,d=a.length;f<d;f++){const m=u[f],g=a[f];m!==0&&(qh.fromBufferAttribute(g,e),c?fc.addScaledVector(qh,m):fc.addScaledVector(qh.sub(t),m))}t.add(fc)}return t}raycast(e,t){const r=this.geometry,o=this.material,a=this.matrixWorld;o!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),lc.copy(r.boundingSphere),lc.applyMatrix4(a),ds.copy(e.ray).recast(e.near),!(lc.containsPoint(ds.origin)===!1&&(ds.intersectSphere(lc,kg)===null||ds.origin.distanceToSquared(kg)>(e.far-e.near)**2))&&(Og.copy(a).invert(),ds.copy(e.ray).applyMatrix4(Og),!(r.boundingBox!==null&&ds.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,ds)))}_computeIntersections(e,t,r){let o;const a=this.geometry,c=this.material,u=a.index,f=a.attributes.position,d=a.attributes.uv,m=a.attributes.uv1,g=a.attributes.normal,v=a.groups,S=a.drawRange;if(u!==null)if(Array.isArray(c))for(let M=0,w=v.length;M<w;M++){const y=v[M],_=c[y.materialIndex],L=Math.max(y.start,S.start),P=Math.min(u.count,Math.min(y.start+y.count,S.start+S.count));for(let T=L,V=P;T<V;T+=3){const I=u.getX(T),N=u.getX(T+1),z=u.getX(T+2);o=pc(this,_,e,r,d,m,g,I,N,z),o&&(o.faceIndex=Math.floor(T/3),o.face.materialIndex=y.materialIndex,t.push(o))}}else{const M=Math.max(0,S.start),w=Math.min(u.count,S.start+S.count);for(let y=M,_=w;y<_;y+=3){const L=u.getX(y),P=u.getX(y+1),T=u.getX(y+2);o=pc(this,c,e,r,d,m,g,L,P,T),o&&(o.faceIndex=Math.floor(y/3),t.push(o))}}else if(f!==void 0)if(Array.isArray(c))for(let M=0,w=v.length;M<w;M++){const y=v[M],_=c[y.materialIndex],L=Math.max(y.start,S.start),P=Math.min(f.count,Math.min(y.start+y.count,S.start+S.count));for(let T=L,V=P;T<V;T+=3){const I=T,N=T+1,z=T+2;o=pc(this,_,e,r,d,m,g,I,N,z),o&&(o.faceIndex=Math.floor(T/3),o.face.materialIndex=y.materialIndex,t.push(o))}}else{const M=Math.max(0,S.start),w=Math.min(f.count,S.start+S.count);for(let y=M,_=w;y<_;y+=3){const L=y,P=y+1,T=y+2;o=pc(this,c,e,r,d,m,g,L,P,T),o&&(o.faceIndex=Math.floor(y/3),t.push(o))}}}}function TS(i,e,t,r,o,a,c,u){let f;if(e.side===On?f=r.intersectTriangle(c,a,o,!0,u):f=r.intersectTriangle(o,a,c,e.side===$r,u),f===null)return null;dc.copy(u),dc.applyMatrix4(i.matrixWorld);const d=t.ray.origin.distanceTo(dc);return d<t.near||d>t.far?null:{distance:d,point:dc.clone(),object:i}}function pc(i,e,t,r,o,a,c,u,f,d){i.getVertexPosition(u,cc),i.getVertexPosition(f,uc),i.getVertexPosition(d,hc);const m=TS(i,e,t,r,cc,uc,hc,zg);if(m){const g=new B;bi.getBarycoord(zg,cc,uc,hc,g),o&&(m.uv=bi.getInterpolatedAttribute(o,u,f,d,g,new ze)),a&&(m.uv1=bi.getInterpolatedAttribute(a,u,f,d,g,new ze)),c&&(m.normal=bi.getInterpolatedAttribute(c,u,f,d,g,new B),m.normal.dot(r.direction)>0&&m.normal.multiplyScalar(-1));const v={a:u,b:f,c:d,normal:new B,materialIndex:0};bi.getNormal(cc,uc,hc,v.normal),m.face=v,m.barycoord=g}return m}class Pn extends _i{constructor(e=1,t=1,r=1,o=1,a=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:o,heightSegments:a,depthSegments:c};const u=this;o=Math.floor(o),a=Math.floor(a),c=Math.floor(c);const f=[],d=[],m=[],g=[];let v=0,S=0;M("z","y","x",-1,-1,r,t,e,c,a,0),M("z","y","x",1,-1,r,t,-e,c,a,1),M("x","z","y",1,1,e,r,t,o,c,2),M("x","z","y",1,-1,e,r,-t,o,c,3),M("x","y","z",1,-1,e,t,r,o,a,4),M("x","y","z",-1,-1,e,t,-r,o,a,5),this.setIndex(f),this.setAttribute("position",new zn(d,3)),this.setAttribute("normal",new zn(m,3)),this.setAttribute("uv",new zn(g,2));function M(w,y,_,L,P,T,V,I,N,z,R){const A=T/N,F=V/z,$=T/2,Y=V/2,ie=I/2,ce=N+1,oe=z+1;let ue=0,G=0;const he=new B;for(let ae=0;ae<oe;ae++){const k=ae*F-Y;for(let ee=0;ee<ce;ee++){const Fe=ee*A-$;he[w]=Fe*L,he[y]=k*P,he[_]=ie,d.push(he.x,he.y,he.z),he[w]=0,he[y]=0,he[_]=I>0?1:-1,m.push(he.x,he.y,he.z),g.push(ee/N),g.push(1-ae/z),ue+=1}}for(let ae=0;ae<z;ae++)for(let k=0;k<N;k++){const ee=v+k+ce*ae,Fe=v+k+ce*(ae+1),J=v+(k+1)+ce*(ae+1),fe=v+(k+1)+ce*ae;f.push(ee,Fe,fe),f.push(Fe,J,fe),G+=6}u.addGroup(S,G,R),S+=G,v+=ue}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Do(i){const e={};for(const t in i){e[t]={};for(const r in i[t]){const o=i[t][r];o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)?o.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=o.clone():Array.isArray(o)?e[t][r]=o.slice():e[t][r]=o}}return e}function Un(i){const e={};for(let t=0;t<i.length;t++){const r=Do(i[t]);for(const o in r)e[o]=r[o]}return e}function AS(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function bv(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:At.workingColorSpace}const CS={clone:Do,merge:Un};var RS=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,PS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class vr extends ko{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=RS,this.fragmentShader=PS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Do(e.uniforms),this.uniformsGroups=AS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const o in this.uniforms){const c=this.uniforms[o].value;c&&c.isTexture?t.uniforms[o]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[o]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[o]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[o]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[o]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[o]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[o]={type:"m4",value:c.toArray()}:t.uniforms[o]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const o in this.extensions)this.extensions[o]===!0&&(r[o]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}}class Lv extends fn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new It,this.projectionMatrix=new It,this.projectionMatrixInverse=new It,this.coordinateSystem=dr}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Wr=new B,Bg=new ze,Hg=new ze;class mi extends Lv{constructor(e=50,t=1,r=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=o,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=za*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ba*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return za*2*Math.atan(Math.tan(ba*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){Wr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Wr.x,Wr.y).multiplyScalar(-e/Wr.z),Wr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(Wr.x,Wr.y).multiplyScalar(-e/Wr.z)}getViewSize(e,t){return this.getViewBounds(e,Bg,Hg),t.subVectors(Hg,Bg)}setViewOffset(e,t,r,o,a,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=o,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ba*.5*this.fov)/this.zoom,r=2*t,o=this.aspect*r,a=-.5*o;const c=this.view;if(this.view!==null&&this.view.enabled){const f=c.fullWidth,d=c.fullHeight;a+=c.offsetX*o/f,t-=c.offsetY*r/d,o*=c.width/f,r*=c.height/d}const u=this.filmOffset;u!==0&&(a+=e*u/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+o,t,t-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const uo=-90,ho=1;class bS extends fn{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new mi(uo,ho,e,t);o.layers=this.layers,this.add(o);const a=new mi(uo,ho,e,t);a.layers=this.layers,this.add(a);const c=new mi(uo,ho,e,t);c.layers=this.layers,this.add(c);const u=new mi(uo,ho,e,t);u.layers=this.layers,this.add(u);const f=new mi(uo,ho,e,t);f.layers=this.layers,this.add(f);const d=new mi(uo,ho,e,t);d.layers=this.layers,this.add(d)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,o,a,c,u,f]=t;for(const d of t)this.remove(d);if(e===dr)r.up.set(0,1,0),r.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),u.up.set(0,1,0),u.lookAt(0,0,1),f.up.set(0,1,0),f.lookAt(0,0,-1);else if(e===Oc)r.up.set(0,-1,0),r.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),u.up.set(0,-1,0),u.lookAt(0,0,1),f.up.set(0,-1,0),f.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const d of t)this.add(d),d.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:o}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[a,c,u,f,d,m]=this.children,g=e.getRenderTarget(),v=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),M=e.xr.enabled;e.xr.enabled=!1;const w=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,o),e.render(t,a),e.setRenderTarget(r,1,o),e.render(t,c),e.setRenderTarget(r,2,o),e.render(t,u),e.setRenderTarget(r,3,o),e.render(t,f),e.setRenderTarget(r,4,o),e.render(t,d),r.texture.generateMipmaps=w,e.setRenderTarget(r,5,o),e.render(t,m),e.setRenderTarget(g,v,S),e.xr.enabled=M,r.texture.needsPMREMUpdate=!0}}class Dv extends Rn{constructor(e,t,r,o,a,c,u,f,d,m){e=e!==void 0?e:[],t=t!==void 0?t:Ro,super(e,t,r,o,a,c,u,f,d,m),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class LS extends Ts{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},o=[r,r,r,r,r,r];this.texture=new Dv(o,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Wi}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},o=new Pn(5,5,5),a=new vr({name:"CubemapFromEquirect",uniforms:Do(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:On,blending:qr});a.uniforms.tEquirect.value=t;const c=new Pt(o,a),u=t.minFilter;return t.minFilter===ws&&(t.minFilter=Wi),new bS(1,10,this).update(e,c),t.minFilter=u,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,r,o){const a=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,r,o);e.setRenderTarget(a)}}const Kh=new B,DS=new B,IS=new gt;class _s{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,o){return this.normal.set(e,t,r),this.constant=o,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const o=Kh.subVectors(r,t).cross(DS.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(o,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const r=e.delta(Kh),o=this.normal.dot(r);if(o===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/o;return a<0||a>1?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||IS.getNormalMatrix(e),o=this.coplanarPoint(Kh).applyMatrix4(e),a=this.normal.applyMatrix3(r).normalize();return this.constant=-o.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ps=new Oo,mc=new B;class Rd{constructor(e=new _s,t=new _s,r=new _s,o=new _s,a=new _s,c=new _s){this.planes=[e,t,r,o,a,c]}set(e,t,r,o,a,c){const u=this.planes;return u[0].copy(e),u[1].copy(t),u[2].copy(r),u[3].copy(o),u[4].copy(a),u[5].copy(c),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=dr){const r=this.planes,o=e.elements,a=o[0],c=o[1],u=o[2],f=o[3],d=o[4],m=o[5],g=o[6],v=o[7],S=o[8],M=o[9],w=o[10],y=o[11],_=o[12],L=o[13],P=o[14],T=o[15];if(r[0].setComponents(f-a,v-d,y-S,T-_).normalize(),r[1].setComponents(f+a,v+d,y+S,T+_).normalize(),r[2].setComponents(f+c,v+m,y+M,T+L).normalize(),r[3].setComponents(f-c,v-m,y-M,T-L).normalize(),r[4].setComponents(f-u,v-g,y-w,T-P).normalize(),t===dr)r[5].setComponents(f+u,v+g,y+w,T+P).normalize();else if(t===Oc)r[5].setComponents(u,g,w,P).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ps.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ps.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ps)}intersectsSprite(e){return ps.center.set(0,0,0),ps.radius=.7071067811865476,ps.applyMatrix4(e.matrixWorld),this.intersectsSphere(ps)}intersectsSphere(e){const t=this.planes,r=e.center,o=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(r)<o)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const o=t[r];if(mc.x=o.normal.x>0?e.max.x:e.min.x,mc.y=o.normal.y>0?e.max.y:e.min.y,mc.z=o.normal.z>0?e.max.z:e.min.z,o.distanceToPoint(mc)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Iv(){let i=null,e=!1,t=null,r=null;function o(a,c){t(a,c),r=i.requestAnimationFrame(o)}return{start:function(){e!==!0&&t!==null&&(r=i.requestAnimationFrame(o),e=!0)},stop:function(){i.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){i=a}}}function NS(i){const e=new WeakMap;function t(u,f){const d=u.array,m=u.usage,g=d.byteLength,v=i.createBuffer();i.bindBuffer(f,v),i.bufferData(f,d,m),u.onUploadCallback();let S;if(d instanceof Float32Array)S=i.FLOAT;else if(d instanceof Uint16Array)u.isFloat16BufferAttribute?S=i.HALF_FLOAT:S=i.UNSIGNED_SHORT;else if(d instanceof Int16Array)S=i.SHORT;else if(d instanceof Uint32Array)S=i.UNSIGNED_INT;else if(d instanceof Int32Array)S=i.INT;else if(d instanceof Int8Array)S=i.BYTE;else if(d instanceof Uint8Array)S=i.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)S=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:v,type:S,bytesPerElement:d.BYTES_PER_ELEMENT,version:u.version,size:g}}function r(u,f,d){const m=f.array,g=f.updateRanges;if(i.bindBuffer(d,u),g.length===0)i.bufferSubData(d,0,m);else{g.sort((S,M)=>S.start-M.start);let v=0;for(let S=1;S<g.length;S++){const M=g[v],w=g[S];w.start<=M.start+M.count+1?M.count=Math.max(M.count,w.start+w.count-M.start):(++v,g[v]=w)}g.length=v+1;for(let S=0,M=g.length;S<M;S++){const w=g[S];i.bufferSubData(d,w.start*m.BYTES_PER_ELEMENT,m,w.start,w.count)}f.clearUpdateRanges()}f.onUploadCallback()}function o(u){return u.isInterleavedBufferAttribute&&(u=u.data),e.get(u)}function a(u){u.isInterleavedBufferAttribute&&(u=u.data);const f=e.get(u);f&&(i.deleteBuffer(f.buffer),e.delete(u))}function c(u,f){if(u.isInterleavedBufferAttribute&&(u=u.data),u.isGLBufferAttribute){const m=e.get(u);(!m||m.version<u.version)&&e.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}const d=e.get(u);if(d===void 0)e.set(u,t(u,f));else if(d.version<u.version){if(d.size!==u.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(d.buffer,u,f),d.version=u.version}}return{get:o,remove:a,update:c}}class zo extends _i{constructor(e=1,t=1,r=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:o};const a=e/2,c=t/2,u=Math.floor(r),f=Math.floor(o),d=u+1,m=f+1,g=e/u,v=t/f,S=[],M=[],w=[],y=[];for(let _=0;_<m;_++){const L=_*v-c;for(let P=0;P<d;P++){const T=P*g-a;M.push(T,-L,0),w.push(0,0,1),y.push(P/u),y.push(1-_/f)}}for(let _=0;_<f;_++)for(let L=0;L<u;L++){const P=L+d*_,T=L+d*(_+1),V=L+1+d*(_+1),I=L+1+d*_;S.push(P,T,I),S.push(T,V,I)}this.setIndex(S),this.setAttribute("position",new zn(M,3)),this.setAttribute("normal",new zn(w,3)),this.setAttribute("uv",new zn(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zo(e.width,e.height,e.widthSegments,e.heightSegments)}}var US=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,FS=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,OS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zS=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,BS=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,HS=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,VS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,GS=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,WS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,XS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,YS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,qS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,KS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$S=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ZS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,QS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,JS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,eM=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,tM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,nM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,iM=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,rM=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,sM=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,oM=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,aM=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,lM=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,cM=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,uM=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,hM="gl_FragColor = linearToOutputTexel( gl_FragColor );",fM=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,dM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,pM=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,mM=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,gM=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,vM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,_M=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xM=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,yM=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,SM=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,MM=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,wM=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,EM=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,TM=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,AM=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,CM=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,RM=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,PM=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bM=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,LM=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,DM=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,IM=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,NM=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,UM=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,FM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,OM=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,kM=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,zM=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,BM=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,HM=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,VM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,GM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,WM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,XM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,YM=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,qM=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,KM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$M=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ZM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,QM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,JM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,e1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,t1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,n1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,i1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,r1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,s1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,o1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,a1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,l1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,c1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,u1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,h1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,f1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,d1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,p1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,m1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,g1=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,v1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,_1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,x1=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,y1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,S1=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,M1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,w1=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,E1=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,T1=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,A1=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,C1=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,R1=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,P1=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,b1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,L1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,D1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,I1=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const N1=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,U1=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,F1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,O1=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,k1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,z1=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,B1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,H1=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,V1=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,G1=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,W1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,X1=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,j1=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Y1=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,q1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,K1=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$1=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Z1=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Q1=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,J1=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ew=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,tw=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,nw=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,iw=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rw=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,sw=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ow=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,aw=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lw=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,cw=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,uw=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hw=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,fw=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dw=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,vt={alphahash_fragment:US,alphahash_pars_fragment:FS,alphamap_fragment:OS,alphamap_pars_fragment:kS,alphatest_fragment:zS,alphatest_pars_fragment:BS,aomap_fragment:HS,aomap_pars_fragment:VS,batching_pars_vertex:GS,batching_vertex:WS,begin_vertex:XS,beginnormal_vertex:jS,bsdfs:YS,iridescence_fragment:qS,bumpmap_pars_fragment:KS,clipping_planes_fragment:$S,clipping_planes_pars_fragment:ZS,clipping_planes_pars_vertex:QS,clipping_planes_vertex:JS,color_fragment:eM,color_pars_fragment:tM,color_pars_vertex:nM,color_vertex:iM,common:rM,cube_uv_reflection_fragment:sM,defaultnormal_vertex:oM,displacementmap_pars_vertex:aM,displacementmap_vertex:lM,emissivemap_fragment:cM,emissivemap_pars_fragment:uM,colorspace_fragment:hM,colorspace_pars_fragment:fM,envmap_fragment:dM,envmap_common_pars_fragment:pM,envmap_pars_fragment:mM,envmap_pars_vertex:gM,envmap_physical_pars_fragment:CM,envmap_vertex:vM,fog_vertex:_M,fog_pars_vertex:xM,fog_fragment:yM,fog_pars_fragment:SM,gradientmap_pars_fragment:MM,lightmap_pars_fragment:wM,lights_lambert_fragment:EM,lights_lambert_pars_fragment:TM,lights_pars_begin:AM,lights_toon_fragment:RM,lights_toon_pars_fragment:PM,lights_phong_fragment:bM,lights_phong_pars_fragment:LM,lights_physical_fragment:DM,lights_physical_pars_fragment:IM,lights_fragment_begin:NM,lights_fragment_maps:UM,lights_fragment_end:FM,logdepthbuf_fragment:OM,logdepthbuf_pars_fragment:kM,logdepthbuf_pars_vertex:zM,logdepthbuf_vertex:BM,map_fragment:HM,map_pars_fragment:VM,map_particle_fragment:GM,map_particle_pars_fragment:WM,metalnessmap_fragment:XM,metalnessmap_pars_fragment:jM,morphinstance_vertex:YM,morphcolor_vertex:qM,morphnormal_vertex:KM,morphtarget_pars_vertex:$M,morphtarget_vertex:ZM,normal_fragment_begin:QM,normal_fragment_maps:JM,normal_pars_fragment:e1,normal_pars_vertex:t1,normal_vertex:n1,normalmap_pars_fragment:i1,clearcoat_normal_fragment_begin:r1,clearcoat_normal_fragment_maps:s1,clearcoat_pars_fragment:o1,iridescence_pars_fragment:a1,opaque_fragment:l1,packing:c1,premultiplied_alpha_fragment:u1,project_vertex:h1,dithering_fragment:f1,dithering_pars_fragment:d1,roughnessmap_fragment:p1,roughnessmap_pars_fragment:m1,shadowmap_pars_fragment:g1,shadowmap_pars_vertex:v1,shadowmap_vertex:_1,shadowmask_pars_fragment:x1,skinbase_vertex:y1,skinning_pars_vertex:S1,skinning_vertex:M1,skinnormal_vertex:w1,specularmap_fragment:E1,specularmap_pars_fragment:T1,tonemapping_fragment:A1,tonemapping_pars_fragment:C1,transmission_fragment:R1,transmission_pars_fragment:P1,uv_pars_fragment:b1,uv_pars_vertex:L1,uv_vertex:D1,worldpos_vertex:I1,background_vert:N1,background_frag:U1,backgroundCube_vert:F1,backgroundCube_frag:O1,cube_vert:k1,cube_frag:z1,depth_vert:B1,depth_frag:H1,distanceRGBA_vert:V1,distanceRGBA_frag:G1,equirect_vert:W1,equirect_frag:X1,linedashed_vert:j1,linedashed_frag:Y1,meshbasic_vert:q1,meshbasic_frag:K1,meshlambert_vert:$1,meshlambert_frag:Z1,meshmatcap_vert:Q1,meshmatcap_frag:J1,meshnormal_vert:ew,meshnormal_frag:tw,meshphong_vert:nw,meshphong_frag:iw,meshphysical_vert:rw,meshphysical_frag:sw,meshtoon_vert:ow,meshtoon_frag:aw,points_vert:lw,points_frag:cw,shadow_vert:uw,shadow_frag:hw,sprite_vert:fw,sprite_frag:dw},Ne={common:{diffuse:{value:new ht(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new gt},alphaMap:{value:null},alphaMapTransform:{value:new gt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new gt}},envmap:{envMap:{value:null},envMapRotation:{value:new gt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new gt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new gt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new gt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new gt},normalScale:{value:new ze(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new gt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new gt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new gt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new gt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ht(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ht(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new gt},alphaTest:{value:0},uvTransform:{value:new gt}},sprite:{diffuse:{value:new ht(16777215)},opacity:{value:1},center:{value:new ze(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new gt},alphaMap:{value:null},alphaMapTransform:{value:new gt},alphaTest:{value:0}}},Vi={basic:{uniforms:Un([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.fog]),vertexShader:vt.meshbasic_vert,fragmentShader:vt.meshbasic_frag},lambert:{uniforms:Un([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,Ne.lights,{emissive:{value:new ht(0)}}]),vertexShader:vt.meshlambert_vert,fragmentShader:vt.meshlambert_frag},phong:{uniforms:Un([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,Ne.lights,{emissive:{value:new ht(0)},specular:{value:new ht(1118481)},shininess:{value:30}}]),vertexShader:vt.meshphong_vert,fragmentShader:vt.meshphong_frag},standard:{uniforms:Un([Ne.common,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.roughnessmap,Ne.metalnessmap,Ne.fog,Ne.lights,{emissive:{value:new ht(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:vt.meshphysical_vert,fragmentShader:vt.meshphysical_frag},toon:{uniforms:Un([Ne.common,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.gradientmap,Ne.fog,Ne.lights,{emissive:{value:new ht(0)}}]),vertexShader:vt.meshtoon_vert,fragmentShader:vt.meshtoon_frag},matcap:{uniforms:Un([Ne.common,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,{matcap:{value:null}}]),vertexShader:vt.meshmatcap_vert,fragmentShader:vt.meshmatcap_frag},points:{uniforms:Un([Ne.points,Ne.fog]),vertexShader:vt.points_vert,fragmentShader:vt.points_frag},dashed:{uniforms:Un([Ne.common,Ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:vt.linedashed_vert,fragmentShader:vt.linedashed_frag},depth:{uniforms:Un([Ne.common,Ne.displacementmap]),vertexShader:vt.depth_vert,fragmentShader:vt.depth_frag},normal:{uniforms:Un([Ne.common,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,{opacity:{value:1}}]),vertexShader:vt.meshnormal_vert,fragmentShader:vt.meshnormal_frag},sprite:{uniforms:Un([Ne.sprite,Ne.fog]),vertexShader:vt.sprite_vert,fragmentShader:vt.sprite_frag},background:{uniforms:{uvTransform:{value:new gt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:vt.background_vert,fragmentShader:vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new gt}},vertexShader:vt.backgroundCube_vert,fragmentShader:vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:vt.cube_vert,fragmentShader:vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:vt.equirect_vert,fragmentShader:vt.equirect_frag},distanceRGBA:{uniforms:Un([Ne.common,Ne.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:vt.distanceRGBA_vert,fragmentShader:vt.distanceRGBA_frag},shadow:{uniforms:Un([Ne.lights,Ne.fog,{color:{value:new ht(0)},opacity:{value:1}}]),vertexShader:vt.shadow_vert,fragmentShader:vt.shadow_frag}};Vi.physical={uniforms:Un([Vi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new gt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new gt},clearcoatNormalScale:{value:new ze(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new gt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new gt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new gt},sheen:{value:0},sheenColor:{value:new ht(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new gt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new gt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new gt},transmissionSamplerSize:{value:new ze},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new gt},attenuationDistance:{value:0},attenuationColor:{value:new ht(0)},specularColor:{value:new ht(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new gt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new gt},anisotropyVector:{value:new ze},anisotropyMap:{value:null},anisotropyMapTransform:{value:new gt}}]),vertexShader:vt.meshphysical_vert,fragmentShader:vt.meshphysical_frag};const gc={r:0,b:0,g:0},ms=new vi,pw=new It;function mw(i,e,t,r,o,a,c){const u=new ht(0);let f=a===!0?0:1,d,m,g=null,v=0,S=null;function M(L){let P=L.isScene===!0?L.background:null;return P&&P.isTexture&&(P=(L.backgroundBlurriness>0?t:e).get(P)),P}function w(L){let P=!1;const T=M(L);T===null?_(u,f):T&&T.isColor&&(_(T,1),P=!0);const V=i.xr.getEnvironmentBlendMode();V==="additive"?r.buffers.color.setClear(0,0,0,1,c):V==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,c),(i.autoClear||P)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(L,P){const T=M(P);T&&(T.isCubeTexture||T.mapping===Bc)?(m===void 0&&(m=new Pt(new Pn(1,1,1),new vr({name:"BackgroundCubeMaterial",uniforms:Do(Vi.backgroundCube.uniforms),vertexShader:Vi.backgroundCube.vertexShader,fragmentShader:Vi.backgroundCube.fragmentShader,side:On,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(V,I,N){this.matrixWorld.copyPosition(N.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),o.update(m)),ms.copy(P.backgroundRotation),ms.x*=-1,ms.y*=-1,ms.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(ms.y*=-1,ms.z*=-1),m.material.uniforms.envMap.value=T,m.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,m.material.uniforms.backgroundBlurriness.value=P.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(pw.makeRotationFromEuler(ms)),m.material.toneMapped=At.getTransfer(T.colorSpace)!==Nt,(g!==T||v!==T.version||S!==i.toneMapping)&&(m.material.needsUpdate=!0,g=T,v=T.version,S=i.toneMapping),m.layers.enableAll(),L.unshift(m,m.geometry,m.material,0,0,null)):T&&T.isTexture&&(d===void 0&&(d=new Pt(new zo(2,2),new vr({name:"BackgroundMaterial",uniforms:Do(Vi.background.uniforms),vertexShader:Vi.background.vertexShader,fragmentShader:Vi.background.fragmentShader,side:$r,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),Object.defineProperty(d.material,"map",{get:function(){return this.uniforms.t2D.value}}),o.update(d)),d.material.uniforms.t2D.value=T,d.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,d.material.toneMapped=At.getTransfer(T.colorSpace)!==Nt,T.matrixAutoUpdate===!0&&T.updateMatrix(),d.material.uniforms.uvTransform.value.copy(T.matrix),(g!==T||v!==T.version||S!==i.toneMapping)&&(d.material.needsUpdate=!0,g=T,v=T.version,S=i.toneMapping),d.layers.enableAll(),L.unshift(d,d.geometry,d.material,0,0,null))}function _(L,P){L.getRGB(gc,bv(i)),r.buffers.color.setClear(gc.r,gc.g,gc.b,P,c)}return{getClearColor:function(){return u},setClearColor:function(L,P=1){u.set(L),f=P,_(u,f)},getClearAlpha:function(){return f},setClearAlpha:function(L){f=L,_(u,f)},render:w,addToRenderList:y}}function gw(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),r={},o=v(null);let a=o,c=!1;function u(A,F,$,Y,ie){let ce=!1;const oe=g(Y,$,F);a!==oe&&(a=oe,d(a.object)),ce=S(A,Y,$,ie),ce&&M(A,Y,$,ie),ie!==null&&e.update(ie,i.ELEMENT_ARRAY_BUFFER),(ce||c)&&(c=!1,T(A,F,$,Y),ie!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(ie).buffer))}function f(){return i.createVertexArray()}function d(A){return i.bindVertexArray(A)}function m(A){return i.deleteVertexArray(A)}function g(A,F,$){const Y=$.wireframe===!0;let ie=r[A.id];ie===void 0&&(ie={},r[A.id]=ie);let ce=ie[F.id];ce===void 0&&(ce={},ie[F.id]=ce);let oe=ce[Y];return oe===void 0&&(oe=v(f()),ce[Y]=oe),oe}function v(A){const F=[],$=[],Y=[];for(let ie=0;ie<t;ie++)F[ie]=0,$[ie]=0,Y[ie]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:$,attributeDivisors:Y,object:A,attributes:{},index:null}}function S(A,F,$,Y){const ie=a.attributes,ce=F.attributes;let oe=0;const ue=$.getAttributes();for(const G in ue)if(ue[G].location>=0){const ae=ie[G];let k=ce[G];if(k===void 0&&(G==="instanceMatrix"&&A.instanceMatrix&&(k=A.instanceMatrix),G==="instanceColor"&&A.instanceColor&&(k=A.instanceColor)),ae===void 0||ae.attribute!==k||k&&ae.data!==k.data)return!0;oe++}return a.attributesNum!==oe||a.index!==Y}function M(A,F,$,Y){const ie={},ce=F.attributes;let oe=0;const ue=$.getAttributes();for(const G in ue)if(ue[G].location>=0){let ae=ce[G];ae===void 0&&(G==="instanceMatrix"&&A.instanceMatrix&&(ae=A.instanceMatrix),G==="instanceColor"&&A.instanceColor&&(ae=A.instanceColor));const k={};k.attribute=ae,ae&&ae.data&&(k.data=ae.data),ie[G]=k,oe++}a.attributes=ie,a.attributesNum=oe,a.index=Y}function w(){const A=a.newAttributes;for(let F=0,$=A.length;F<$;F++)A[F]=0}function y(A){_(A,0)}function _(A,F){const $=a.newAttributes,Y=a.enabledAttributes,ie=a.attributeDivisors;$[A]=1,Y[A]===0&&(i.enableVertexAttribArray(A),Y[A]=1),ie[A]!==F&&(i.vertexAttribDivisor(A,F),ie[A]=F)}function L(){const A=a.newAttributes,F=a.enabledAttributes;for(let $=0,Y=F.length;$<Y;$++)F[$]!==A[$]&&(i.disableVertexAttribArray($),F[$]=0)}function P(A,F,$,Y,ie,ce,oe){oe===!0?i.vertexAttribIPointer(A,F,$,ie,ce):i.vertexAttribPointer(A,F,$,Y,ie,ce)}function T(A,F,$,Y){w();const ie=Y.attributes,ce=$.getAttributes(),oe=F.defaultAttributeValues;for(const ue in ce){const G=ce[ue];if(G.location>=0){let he=ie[ue];if(he===void 0&&(ue==="instanceMatrix"&&A.instanceMatrix&&(he=A.instanceMatrix),ue==="instanceColor"&&A.instanceColor&&(he=A.instanceColor)),he!==void 0){const ae=he.normalized,k=he.itemSize,ee=e.get(he);if(ee===void 0)continue;const Fe=ee.buffer,J=ee.type,fe=ee.bytesPerElement,we=J===i.INT||J===i.UNSIGNED_INT||he.gpuType===yd;if(he.isInterleavedBufferAttribute){const ve=he.data,Ae=ve.stride,Be=he.offset;if(ve.isInstancedInterleavedBuffer){for(let Ze=0;Ze<G.locationSize;Ze++)_(G.location+Ze,ve.meshPerAttribute);A.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ve.meshPerAttribute*ve.count)}else for(let Ze=0;Ze<G.locationSize;Ze++)y(G.location+Ze);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let Ze=0;Ze<G.locationSize;Ze++)P(G.location+Ze,k/G.locationSize,J,ae,Ae*fe,(Be+k/G.locationSize*Ze)*fe,we)}else{if(he.isInstancedBufferAttribute){for(let ve=0;ve<G.locationSize;ve++)_(G.location+ve,he.meshPerAttribute);A.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let ve=0;ve<G.locationSize;ve++)y(G.location+ve);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let ve=0;ve<G.locationSize;ve++)P(G.location+ve,k/G.locationSize,J,ae,k*fe,k/G.locationSize*ve*fe,we)}}else if(oe!==void 0){const ae=oe[ue];if(ae!==void 0)switch(ae.length){case 2:i.vertexAttrib2fv(G.location,ae);break;case 3:i.vertexAttrib3fv(G.location,ae);break;case 4:i.vertexAttrib4fv(G.location,ae);break;default:i.vertexAttrib1fv(G.location,ae)}}}}L()}function V(){z();for(const A in r){const F=r[A];for(const $ in F){const Y=F[$];for(const ie in Y)m(Y[ie].object),delete Y[ie];delete F[$]}delete r[A]}}function I(A){if(r[A.id]===void 0)return;const F=r[A.id];for(const $ in F){const Y=F[$];for(const ie in Y)m(Y[ie].object),delete Y[ie];delete F[$]}delete r[A.id]}function N(A){for(const F in r){const $=r[F];if($[A.id]===void 0)continue;const Y=$[A.id];for(const ie in Y)m(Y[ie].object),delete Y[ie];delete $[A.id]}}function z(){R(),c=!0,a!==o&&(a=o,d(a.object))}function R(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:u,reset:z,resetDefaultState:R,dispose:V,releaseStatesOfGeometry:I,releaseStatesOfProgram:N,initAttributes:w,enableAttribute:y,disableUnusedAttributes:L}}function vw(i,e,t){let r;function o(d){r=d}function a(d,m){i.drawArrays(r,d,m),t.update(m,r,1)}function c(d,m,g){g!==0&&(i.drawArraysInstanced(r,d,m,g),t.update(m,r,g))}function u(d,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,d,0,m,0,g);let S=0;for(let M=0;M<g;M++)S+=m[M];t.update(S,r,1)}function f(d,m,g,v){if(g===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let M=0;M<d.length;M++)c(d[M],m[M],v[M]);else{S.multiDrawArraysInstancedWEBGL(r,d,0,m,0,v,0,g);let M=0;for(let w=0;w<g;w++)M+=m[w]*v[w];t.update(M,r,1)}}this.setMode=o,this.render=a,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=f}function _w(i,e,t,r){let o;function a(){if(o!==void 0)return o;if(e.has("EXT_texture_filter_anisotropic")===!0){const N=e.get("EXT_texture_filter_anisotropic");o=i.getParameter(N.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function c(N){return!(N!==Li&&r.convert(N)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function u(N){const z=N===Wa&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(N!==gr&&r.convert(N)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&N!==Xi&&!z)}function f(N){if(N==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";N="mediump"}return N==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let d=t.precision!==void 0?t.precision:"highp";const m=f(d);m!==d&&(console.warn("THREE.WebGLRenderer:",d,"not supported, using",m,"instead."),d=m);const g=t.logarithmicDepthBuffer===!0,v=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),S=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),w=i.getParameter(i.MAX_TEXTURE_SIZE),y=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),L=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),P=i.getParameter(i.MAX_VARYING_VECTORS),T=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),V=M>0,I=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:f,textureFormatReadable:c,textureTypeReadable:u,precision:d,logarithmicDepthBuffer:g,reverseDepthBuffer:v,maxTextures:S,maxVertexTextures:M,maxTextureSize:w,maxCubemapSize:y,maxAttributes:_,maxVertexUniforms:L,maxVaryings:P,maxFragmentUniforms:T,vertexTextures:V,maxSamples:I}}function xw(i){const e=this;let t=null,r=0,o=!1,a=!1;const c=new _s,u=new gt,f={value:null,needsUpdate:!1};this.uniform=f,this.numPlanes=0,this.numIntersection=0,this.init=function(g,v){const S=g.length!==0||v||r!==0||o;return o=v,r=g.length,S},this.beginShadows=function(){a=!0,m(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(g,v){t=m(g,v,0)},this.setState=function(g,v,S){const M=g.clippingPlanes,w=g.clipIntersection,y=g.clipShadows,_=i.get(g);if(!o||M===null||M.length===0||a&&!y)a?m(null):d();else{const L=a?0:r,P=L*4;let T=_.clippingState||null;f.value=T,T=m(M,v,P,S);for(let V=0;V!==P;++V)T[V]=t[V];_.clippingState=T,this.numIntersection=w?this.numPlanes:0,this.numPlanes+=L}};function d(){f.value!==t&&(f.value=t,f.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function m(g,v,S,M){const w=g!==null?g.length:0;let y=null;if(w!==0){if(y=f.value,M!==!0||y===null){const _=S+w*4,L=v.matrixWorldInverse;u.getNormalMatrix(L),(y===null||y.length<_)&&(y=new Float32Array(_));for(let P=0,T=S;P!==w;++P,T+=4)c.copy(g[P]).applyMatrix4(L,u),c.normal.toArray(y,T),y[T+3]=c.constant}f.value=y,f.needsUpdate=!0}return e.numPlanes=w,e.numIntersection=0,y}}function yw(i){let e=new WeakMap;function t(c,u){return u===Df?c.mapping=Ro:u===If&&(c.mapping=Po),c}function r(c){if(c&&c.isTexture){const u=c.mapping;if(u===Df||u===If)if(e.has(c)){const f=e.get(c).texture;return t(f,c.mapping)}else{const f=c.image;if(f&&f.height>0){const d=new LS(f.height);return d.fromEquirectangularTexture(i,c),e.set(c,d),c.addEventListener("dispose",o),t(d.texture,c.mapping)}else return null}}return c}function o(c){const u=c.target;u.removeEventListener("dispose",o);const f=e.get(u);f!==void 0&&(e.delete(u),f.dispose())}function a(){e=new WeakMap}return{get:r,dispose:a}}class Nv extends Lv{constructor(e=-1,t=1,r=1,o=-1,a=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=o,this.near=a,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,o,a,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=o,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let a=r-e,c=r+e,u=o+t,f=o-t;if(this.view!==null&&this.view.enabled){const d=(this.right-this.left)/this.view.fullWidth/this.zoom,m=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=d*this.view.offsetX,c=a+d*this.view.width,u-=m*this.view.offsetY,f=u-m*this.view.height}this.projectionMatrix.makeOrthographic(a,c,u,f,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const xo=4,Vg=[.125,.215,.35,.446,.526,.582],Ss=20,$h=new Nv,Gg=new ht;let Zh=null,Qh=0,Jh=0,ef=!1;const xs=(1+Math.sqrt(5))/2,fo=1/xs,Wg=[new B(-xs,fo,0),new B(xs,fo,0),new B(-fo,0,xs),new B(fo,0,xs),new B(0,xs,-fo),new B(0,xs,fo),new B(-1,1,-1),new B(1,1,-1),new B(-1,1,1),new B(1,1,1)];class Xg{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,r=.1,o=100){Zh=this._renderer.getRenderTarget(),Qh=this._renderer.getActiveCubeFace(),Jh=this._renderer.getActiveMipmapLevel(),ef=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const a=this._allocateTargets();return a.depthBuffer=!0,this._sceneToCubeUV(e,r,o,a),t>0&&this._blur(a,0,0,t),this._applyPMREM(a),this._cleanup(a),a}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Yg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Zh,Qh,Jh),this._renderer.xr.enabled=ef,e.scissorTest=!1,vc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ro||e.mapping===Po?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Zh=this._renderer.getRenderTarget(),Qh=this._renderer.getActiveCubeFace(),Jh=this._renderer.getActiveMipmapLevel(),ef=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:Wi,minFilter:Wi,generateMipmaps:!1,type:Wa,format:Li,colorSpace:Uo,depthBuffer:!1},o=jg(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=jg(e,t,r);const{_lodMax:a}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Sw(a)),this._blurMaterial=Mw(a,e,t)}return o}_compileMaterial(e){const t=new Pt(this._lodPlanes[0],e);this._renderer.compile(t,$h)}_sceneToCubeUV(e,t,r,o){const u=new mi(90,1,t,r),f=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],m=this._renderer,g=m.autoClear,v=m.toneMapping;m.getClearColor(Gg),m.toneMapping=Kr,m.autoClear=!1;const S=new To({name:"PMREM.Background",side:On,depthWrite:!1,depthTest:!1}),M=new Pt(new Pn,S);let w=!1;const y=e.background;y?y.isColor&&(S.color.copy(y),e.background=null,w=!0):(S.color.copy(Gg),w=!0);for(let _=0;_<6;_++){const L=_%3;L===0?(u.up.set(0,f[_],0),u.lookAt(d[_],0,0)):L===1?(u.up.set(0,0,f[_]),u.lookAt(0,d[_],0)):(u.up.set(0,f[_],0),u.lookAt(0,0,d[_]));const P=this._cubeSize;vc(o,L*P,_>2?P:0,P,P),m.setRenderTarget(o),w&&m.render(M,u),m.render(e,u)}M.geometry.dispose(),M.material.dispose(),m.toneMapping=v,m.autoClear=g,e.background=y}_textureToCubeUV(e,t){const r=this._renderer,o=e.mapping===Ro||e.mapping===Po;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=qg()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Yg());const a=o?this._cubemapMaterial:this._equirectMaterial,c=new Pt(this._lodPlanes[0],a),u=a.uniforms;u.envMap.value=e;const f=this._cubeSize;vc(t,0,0,3*f,2*f),r.setRenderTarget(t),r.render(c,$h)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const o=this._lodPlanes.length;for(let a=1;a<o;a++){const c=Math.sqrt(this._sigmas[a]*this._sigmas[a]-this._sigmas[a-1]*this._sigmas[a-1]),u=Wg[(o-a-1)%Wg.length];this._blur(e,a-1,a,c,u)}t.autoClear=r}_blur(e,t,r,o,a){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,r,o,"latitudinal",a),this._halfBlur(c,e,r,r,o,"longitudinal",a)}_halfBlur(e,t,r,o,a,c,u){const f=this._renderer,d=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const m=3,g=new Pt(this._lodPlanes[o],d),v=d.uniforms,S=this._sizeLods[r]-1,M=isFinite(a)?Math.PI/(2*S):2*Math.PI/(2*Ss-1),w=a/M,y=isFinite(a)?1+Math.floor(m*w):Ss;y>Ss&&console.warn(`sigmaRadians, ${a}, is too large and will clip, as it requested ${y} samples when the maximum is set to ${Ss}`);const _=[];let L=0;for(let N=0;N<Ss;++N){const z=N/w,R=Math.exp(-z*z/2);_.push(R),N===0?L+=R:N<y&&(L+=2*R)}for(let N=0;N<_.length;N++)_[N]=_[N]/L;v.envMap.value=e.texture,v.samples.value=y,v.weights.value=_,v.latitudinal.value=c==="latitudinal",u&&(v.poleAxis.value=u);const{_lodMax:P}=this;v.dTheta.value=M,v.mipInt.value=P-r;const T=this._sizeLods[o],V=3*T*(o>P-xo?o-P+xo:0),I=4*(this._cubeSize-T);vc(t,V,I,3*T,2*T),f.setRenderTarget(t),f.render(g,$h)}}function Sw(i){const e=[],t=[],r=[];let o=i;const a=i-xo+1+Vg.length;for(let c=0;c<a;c++){const u=Math.pow(2,o);t.push(u);let f=1/u;c>i-xo?f=Vg[c-i+xo-1]:c===0&&(f=0),r.push(f);const d=1/(u-2),m=-d,g=1+d,v=[m,m,g,m,g,g,m,m,g,g,m,g],S=6,M=6,w=3,y=2,_=1,L=new Float32Array(w*M*S),P=new Float32Array(y*M*S),T=new Float32Array(_*M*S);for(let I=0;I<S;I++){const N=I%3*2/3-1,z=I>2?0:-1,R=[N,z,0,N+2/3,z,0,N+2/3,z+1,0,N,z,0,N+2/3,z+1,0,N,z+1,0];L.set(R,w*M*I),P.set(v,y*M*I);const A=[I,I,I,I,I,I];T.set(A,_*M*I)}const V=new _i;V.setAttribute("position",new ri(L,w)),V.setAttribute("uv",new ri(P,y)),V.setAttribute("faceIndex",new ri(T,_)),e.push(V),o>xo&&o--}return{lodPlanes:e,sizeLods:t,sigmas:r}}function jg(i,e,t){const r=new Ts(i,e,t);return r.texture.mapping=Bc,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function vc(i,e,t,r,o){i.viewport.set(e,t,r,o),i.scissor.set(e,t,r,o)}function Mw(i,e,t){const r=new Float32Array(Ss),o=new B(0,1,0);return new vr({name:"SphericalGaussianBlur",defines:{n:Ss,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:Pd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:qr,depthTest:!1,depthWrite:!1})}function Yg(){return new vr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:qr,depthTest:!1,depthWrite:!1})}function qg(){return new vr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:qr,depthTest:!1,depthWrite:!1})}function Pd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function ww(i){let e=new WeakMap,t=null;function r(u){if(u&&u.isTexture){const f=u.mapping,d=f===Df||f===If,m=f===Ro||f===Po;if(d||m){let g=e.get(u);const v=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==v)return t===null&&(t=new Xg(i)),g=d?t.fromEquirectangular(u,g):t.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),g.texture;if(g!==void 0)return g.texture;{const S=u.image;return d&&S&&S.height>0||m&&S&&o(S)?(t===null&&(t=new Xg(i)),g=d?t.fromEquirectangular(u):t.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),u.addEventListener("dispose",a),g.texture):null}}}return u}function o(u){let f=0;const d=6;for(let m=0;m<d;m++)u[m]!==void 0&&f++;return f===d}function a(u){const f=u.target;f.removeEventListener("dispose",a);const d=e.get(f);d!==void 0&&(e.delete(f),d.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:r,dispose:c}}function Ew(i){const e={};function t(r){if(e[r]!==void 0)return e[r];let o;switch(r){case"WEBGL_depth_texture":o=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":o=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":o=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":o=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:o=i.getExtension(r)}return e[r]=o,o}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const o=t(r);return o===null&&Ra("THREE.WebGLRenderer: "+r+" extension not supported."),o}}}function Tw(i,e,t,r){const o={},a=new WeakMap;function c(g){const v=g.target;v.index!==null&&e.remove(v.index);for(const M in v.attributes)e.remove(v.attributes[M]);for(const M in v.morphAttributes){const w=v.morphAttributes[M];for(let y=0,_=w.length;y<_;y++)e.remove(w[y])}v.removeEventListener("dispose",c),delete o[v.id];const S=a.get(v);S&&(e.remove(S),a.delete(v)),r.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,t.memory.geometries--}function u(g,v){return o[v.id]===!0||(v.addEventListener("dispose",c),o[v.id]=!0,t.memory.geometries++),v}function f(g){const v=g.attributes;for(const M in v)e.update(v[M],i.ARRAY_BUFFER);const S=g.morphAttributes;for(const M in S){const w=S[M];for(let y=0,_=w.length;y<_;y++)e.update(w[y],i.ARRAY_BUFFER)}}function d(g){const v=[],S=g.index,M=g.attributes.position;let w=0;if(S!==null){const L=S.array;w=S.version;for(let P=0,T=L.length;P<T;P+=3){const V=L[P+0],I=L[P+1],N=L[P+2];v.push(V,I,I,N,N,V)}}else if(M!==void 0){const L=M.array;w=M.version;for(let P=0,T=L.length/3-1;P<T;P+=3){const V=P+0,I=P+1,N=P+2;v.push(V,I,I,N,N,V)}}else return;const y=new(Mv(v)?Pv:Rv)(v,1);y.version=w;const _=a.get(g);_&&e.remove(_),a.set(g,y)}function m(g){const v=a.get(g);if(v){const S=g.index;S!==null&&v.version<S.version&&d(g)}else d(g);return a.get(g)}return{get:u,update:f,getWireframeAttribute:m}}function Aw(i,e,t){let r;function o(v){r=v}let a,c;function u(v){a=v.type,c=v.bytesPerElement}function f(v,S){i.drawElements(r,S,a,v*c),t.update(S,r,1)}function d(v,S,M){M!==0&&(i.drawElementsInstanced(r,S,a,v*c,M),t.update(S,r,M))}function m(v,S,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,S,0,a,v,0,M);let y=0;for(let _=0;_<M;_++)y+=S[_];t.update(y,r,1)}function g(v,S,M,w){if(M===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let _=0;_<v.length;_++)d(v[_]/c,S[_],w[_]);else{y.multiDrawElementsInstancedWEBGL(r,S,0,a,v,0,w,0,M);let _=0;for(let L=0;L<M;L++)_+=S[L]*w[L];t.update(_,r,1)}}this.setMode=o,this.setIndex=u,this.render=f,this.renderInstances=d,this.renderMultiDraw=m,this.renderMultiDrawInstances=g}function Cw(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(a,c,u){switch(t.calls++,c){case i.TRIANGLES:t.triangles+=u*(a/3);break;case i.LINES:t.lines+=u*(a/2);break;case i.LINE_STRIP:t.lines+=u*(a-1);break;case i.LINE_LOOP:t.lines+=u*a;break;case i.POINTS:t.points+=u*a;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function o(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:o,update:r}}function Rw(i,e,t){const r=new WeakMap,o=new jt;function a(c,u,f){const d=c.morphTargetInfluences,m=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=m!==void 0?m.length:0;let v=r.get(u);if(v===void 0||v.count!==g){let A=function(){z.dispose(),r.delete(u),u.removeEventListener("dispose",A)};var S=A;v!==void 0&&v.texture.dispose();const M=u.morphAttributes.position!==void 0,w=u.morphAttributes.normal!==void 0,y=u.morphAttributes.color!==void 0,_=u.morphAttributes.position||[],L=u.morphAttributes.normal||[],P=u.morphAttributes.color||[];let T=0;M===!0&&(T=1),w===!0&&(T=2),y===!0&&(T=3);let V=u.attributes.position.count*T,I=1;V>e.maxTextureSize&&(I=Math.ceil(V/e.maxTextureSize),V=e.maxTextureSize);const N=new Float32Array(V*I*4*g),z=new Ev(N,V,I,g);z.type=Xi,z.needsUpdate=!0;const R=T*4;for(let F=0;F<g;F++){const $=_[F],Y=L[F],ie=P[F],ce=V*I*4*F;for(let oe=0;oe<$.count;oe++){const ue=oe*R;M===!0&&(o.fromBufferAttribute($,oe),N[ce+ue+0]=o.x,N[ce+ue+1]=o.y,N[ce+ue+2]=o.z,N[ce+ue+3]=0),w===!0&&(o.fromBufferAttribute(Y,oe),N[ce+ue+4]=o.x,N[ce+ue+5]=o.y,N[ce+ue+6]=o.z,N[ce+ue+7]=0),y===!0&&(o.fromBufferAttribute(ie,oe),N[ce+ue+8]=o.x,N[ce+ue+9]=o.y,N[ce+ue+10]=o.z,N[ce+ue+11]=ie.itemSize===4?o.w:1)}}v={count:g,texture:z,size:new ze(V,I)},r.set(u,v),u.addEventListener("dispose",A)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)f.getUniforms().setValue(i,"morphTexture",c.morphTexture,t);else{let M=0;for(let y=0;y<d.length;y++)M+=d[y];const w=u.morphTargetsRelative?1:1-M;f.getUniforms().setValue(i,"morphTargetBaseInfluence",w),f.getUniforms().setValue(i,"morphTargetInfluences",d)}f.getUniforms().setValue(i,"morphTargetsTexture",v.texture,t),f.getUniforms().setValue(i,"morphTargetsTextureSize",v.size)}return{update:a}}function Pw(i,e,t,r){let o=new WeakMap;function a(f){const d=r.render.frame,m=f.geometry,g=e.get(f,m);if(o.get(g)!==d&&(e.update(g),o.set(g,d)),f.isInstancedMesh&&(f.hasEventListener("dispose",u)===!1&&f.addEventListener("dispose",u),o.get(f)!==d&&(t.update(f.instanceMatrix,i.ARRAY_BUFFER),f.instanceColor!==null&&t.update(f.instanceColor,i.ARRAY_BUFFER),o.set(f,d))),f.isSkinnedMesh){const v=f.skeleton;o.get(v)!==d&&(v.update(),o.set(v,d))}return g}function c(){o=new WeakMap}function u(f){const d=f.target;d.removeEventListener("dispose",u),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:a,dispose:c}}class Uv extends Rn{constructor(e,t,r,o,a,c,u,f,d,m=wo){if(m!==wo&&m!==Lo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&m===wo&&(r=Es),r===void 0&&m===Lo&&(r=bo),super(null,o,a,c,u,f,m,r,d),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=u!==void 0?u:ii,this.minFilter=f!==void 0?f:ii,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Fv=new Rn,Kg=new Uv(1,1),Ov=new Ev,kv=new mS,zv=new Dv,$g=[],Zg=[],Qg=new Float32Array(16),Jg=new Float32Array(9),e0=new Float32Array(4);function Bo(i,e,t){const r=i[0];if(r<=0||r>0)return i;const o=e*t;let a=$g[o];if(a===void 0&&(a=new Float32Array(o),$g[o]=a),e!==0){r.toArray(a,0);for(let c=1,u=0;c!==e;++c)u+=t,i[c].toArray(a,u)}return a}function sn(i,e){if(i.length!==e.length)return!1;for(let t=0,r=i.length;t<r;t++)if(i[t]!==e[t])return!1;return!0}function on(i,e){for(let t=0,r=e.length;t<r;t++)i[t]=e[t]}function Vc(i,e){let t=Zg[e];t===void 0&&(t=new Int32Array(e),Zg[e]=t);for(let r=0;r!==e;++r)t[r]=i.allocateTextureUnit();return t}function bw(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Lw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;i.uniform2fv(this.addr,e),on(t,e)}}function Dw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(sn(t,e))return;i.uniform3fv(this.addr,e),on(t,e)}}function Iw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;i.uniform4fv(this.addr,e),on(t,e)}}function Nw(i,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),on(t,e)}else{if(sn(t,r))return;e0.set(r),i.uniformMatrix2fv(this.addr,!1,e0),on(t,r)}}function Uw(i,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),on(t,e)}else{if(sn(t,r))return;Jg.set(r),i.uniformMatrix3fv(this.addr,!1,Jg),on(t,r)}}function Fw(i,e){const t=this.cache,r=e.elements;if(r===void 0){if(sn(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),on(t,e)}else{if(sn(t,r))return;Qg.set(r),i.uniformMatrix4fv(this.addr,!1,Qg),on(t,r)}}function Ow(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function kw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;i.uniform2iv(this.addr,e),on(t,e)}}function zw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(sn(t,e))return;i.uniform3iv(this.addr,e),on(t,e)}}function Bw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;i.uniform4iv(this.addr,e),on(t,e)}}function Hw(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Vw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(sn(t,e))return;i.uniform2uiv(this.addr,e),on(t,e)}}function Gw(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(sn(t,e))return;i.uniform3uiv(this.addr,e),on(t,e)}}function Ww(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(sn(t,e))return;i.uniform4uiv(this.addr,e),on(t,e)}}function Xw(i,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(i.uniform1i(this.addr,o),r[0]=o);let a;this.type===i.SAMPLER_2D_SHADOW?(Kg.compareFunction=Sv,a=Kg):a=Fv,t.setTexture2D(e||a,o)}function jw(i,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(i.uniform1i(this.addr,o),r[0]=o),t.setTexture3D(e||kv,o)}function Yw(i,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(i.uniform1i(this.addr,o),r[0]=o),t.setTextureCube(e||zv,o)}function qw(i,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(i.uniform1i(this.addr,o),r[0]=o),t.setTexture2DArray(e||Ov,o)}function Kw(i){switch(i){case 5126:return bw;case 35664:return Lw;case 35665:return Dw;case 35666:return Iw;case 35674:return Nw;case 35675:return Uw;case 35676:return Fw;case 5124:case 35670:return Ow;case 35667:case 35671:return kw;case 35668:case 35672:return zw;case 35669:case 35673:return Bw;case 5125:return Hw;case 36294:return Vw;case 36295:return Gw;case 36296:return Ww;case 35678:case 36198:case 36298:case 36306:case 35682:return Xw;case 35679:case 36299:case 36307:return jw;case 35680:case 36300:case 36308:case 36293:return Yw;case 36289:case 36303:case 36311:case 36292:return qw}}function $w(i,e){i.uniform1fv(this.addr,e)}function Zw(i,e){const t=Bo(e,this.size,2);i.uniform2fv(this.addr,t)}function Qw(i,e){const t=Bo(e,this.size,3);i.uniform3fv(this.addr,t)}function Jw(i,e){const t=Bo(e,this.size,4);i.uniform4fv(this.addr,t)}function eE(i,e){const t=Bo(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function tE(i,e){const t=Bo(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function nE(i,e){const t=Bo(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function iE(i,e){i.uniform1iv(this.addr,e)}function rE(i,e){i.uniform2iv(this.addr,e)}function sE(i,e){i.uniform3iv(this.addr,e)}function oE(i,e){i.uniform4iv(this.addr,e)}function aE(i,e){i.uniform1uiv(this.addr,e)}function lE(i,e){i.uniform2uiv(this.addr,e)}function cE(i,e){i.uniform3uiv(this.addr,e)}function uE(i,e){i.uniform4uiv(this.addr,e)}function hE(i,e,t){const r=this.cache,o=e.length,a=Vc(t,o);sn(r,a)||(i.uniform1iv(this.addr,a),on(r,a));for(let c=0;c!==o;++c)t.setTexture2D(e[c]||Fv,a[c])}function fE(i,e,t){const r=this.cache,o=e.length,a=Vc(t,o);sn(r,a)||(i.uniform1iv(this.addr,a),on(r,a));for(let c=0;c!==o;++c)t.setTexture3D(e[c]||kv,a[c])}function dE(i,e,t){const r=this.cache,o=e.length,a=Vc(t,o);sn(r,a)||(i.uniform1iv(this.addr,a),on(r,a));for(let c=0;c!==o;++c)t.setTextureCube(e[c]||zv,a[c])}function pE(i,e,t){const r=this.cache,o=e.length,a=Vc(t,o);sn(r,a)||(i.uniform1iv(this.addr,a),on(r,a));for(let c=0;c!==o;++c)t.setTexture2DArray(e[c]||Ov,a[c])}function mE(i){switch(i){case 5126:return $w;case 35664:return Zw;case 35665:return Qw;case 35666:return Jw;case 35674:return eE;case 35675:return tE;case 35676:return nE;case 5124:case 35670:return iE;case 35667:case 35671:return rE;case 35668:case 35672:return sE;case 35669:case 35673:return oE;case 5125:return aE;case 36294:return lE;case 36295:return cE;case 36296:return uE;case 35678:case 36198:case 36298:case 36306:case 35682:return hE;case 35679:case 36299:case 36307:return fE;case 35680:case 36300:case 36308:case 36293:return dE;case 36289:case 36303:case 36311:case 36292:return pE}}class gE{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=Kw(t.type)}}class vE{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=mE(t.type)}}class _E{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const o=this.seq;for(let a=0,c=o.length;a!==c;++a){const u=o[a];u.setValue(e,t[u.id],r)}}}const tf=/(\w+)(\])?(\[|\.)?/g;function t0(i,e){i.seq.push(e),i.map[e.id]=e}function xE(i,e,t){const r=i.name,o=r.length;for(tf.lastIndex=0;;){const a=tf.exec(r),c=tf.lastIndex;let u=a[1];const f=a[2]==="]",d=a[3];if(f&&(u=u|0),d===void 0||d==="["&&c+2===o){t0(t,d===void 0?new gE(u,i,e):new vE(u,i,e));break}else{let g=t.map[u];g===void 0&&(g=new _E(u),t0(t,g)),t=g}}}class Fc{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<r;++o){const a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);xE(a,c,this)}}setValue(e,t,r,o){const a=this.map[t];a!==void 0&&a.setValue(e,r,o)}setOptional(e,t,r){const o=t[r];o!==void 0&&this.setValue(e,r,o)}static upload(e,t,r,o){for(let a=0,c=t.length;a!==c;++a){const u=t[a],f=r[u.id];f.needsUpdate!==!1&&u.setValue(e,f.value,o)}}static seqWithValue(e,t){const r=[];for(let o=0,a=e.length;o!==a;++o){const c=e[o];c.id in t&&r.push(c)}return r}}function n0(i,e,t){const r=i.createShader(e);return i.shaderSource(r,t),i.compileShader(r),r}const yE=37297;let SE=0;function ME(i,e){const t=i.split(`
`),r=[],o=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let c=o;c<a;c++){const u=c+1;r.push(`${u===e?">":" "} ${u}: ${t[c]}`)}return r.join(`
`)}const i0=new gt;function wE(i){At._getMatrix(i0,At.workingColorSpace,i);const e=`mat3( ${i0.elements.map(t=>t.toFixed(4))} )`;switch(At.getTransfer(i)){case Hc:return[e,"LinearTransferOETF"];case Nt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function r0(i,e,t){const r=i.getShaderParameter(e,i.COMPILE_STATUS),o=i.getShaderInfoLog(e).trim();if(r&&o==="")return"";const a=/ERROR: 0:(\d+)/.exec(o);if(a){const c=parseInt(a[1]);return t.toUpperCase()+`

`+o+`

`+ME(i.getShaderSource(e),c)}else return o}function EE(i,e){const t=wE(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function TE(i,e){let t;switch(e){case Cy:t="Linear";break;case Ry:t="Reinhard";break;case Py:t="Cineon";break;case by:t="ACESFilmic";break;case Dy:t="AgX";break;case Iy:t="Neutral";break;case Ly:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const _c=new B;function AE(){At.getLuminanceCoefficients(_c);const i=_c.x.toFixed(4),e=_c.y.toFixed(4),t=_c.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function CE(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Pa).join(`
`)}function RE(i){const e=[];for(const t in i){const r=i[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function PE(i,e){const t={},r=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let o=0;o<r;o++){const a=i.getActiveAttrib(e,o),c=a.name;let u=1;a.type===i.FLOAT_MAT2&&(u=2),a.type===i.FLOAT_MAT3&&(u=3),a.type===i.FLOAT_MAT4&&(u=4),t[c]={type:a.type,location:i.getAttribLocation(e,c),locationSize:u}}return t}function Pa(i){return i!==""}function s0(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function o0(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const bE=/^[ \t]*#include +<([\w\d./]+)>/gm;function ad(i){return i.replace(bE,DE)}const LE=new Map;function DE(i,e){let t=vt[e];if(t===void 0){const r=LE.get(e);if(r!==void 0)t=vt[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return ad(t)}const IE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function a0(i){return i.replace(IE,NE)}function NE(i,e,t,r){let o="";for(let a=parseInt(e);a<parseInt(t);a++)o+=r.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return o}function l0(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function UE(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===av?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===lv?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ur&&(e="SHADOWMAP_TYPE_VSM"),e}function FE(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ro:case Po:e="ENVMAP_TYPE_CUBE";break;case Bc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function OE(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Po:e="ENVMAP_MODE_REFRACTION";break}return e}function kE(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case cv:e="ENVMAP_BLENDING_MULTIPLY";break;case Ty:e="ENVMAP_BLENDING_MIX";break;case Ay:e="ENVMAP_BLENDING_ADD";break}return e}function zE(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:r,maxMip:t}}function BE(i,e,t,r){const o=i.getContext(),a=t.defines;let c=t.vertexShader,u=t.fragmentShader;const f=UE(t),d=FE(t),m=OE(t),g=kE(t),v=zE(t),S=CE(t),M=RE(a),w=o.createProgram();let y,_,L=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(y=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Pa).join(`
`),y.length>0&&(y+=`
`),_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Pa).join(`
`),_.length>0&&(_+=`
`)):(y=[l0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+f:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Pa).join(`
`),_=[l0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.envMap?"#define "+m:"",t.envMap?"#define "+g:"",v?"#define CUBEUV_TEXEL_WIDTH "+v.texelWidth:"",v?"#define CUBEUV_TEXEL_HEIGHT "+v.texelHeight:"",v?"#define CUBEUV_MAX_MIP "+v.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+f:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Kr?"#define TONE_MAPPING":"",t.toneMapping!==Kr?vt.tonemapping_pars_fragment:"",t.toneMapping!==Kr?TE("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",vt.colorspace_pars_fragment,EE("linearToOutputTexel",t.outputColorSpace),AE(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Pa).join(`
`)),c=ad(c),c=s0(c,t),c=o0(c,t),u=ad(u),u=s0(u,t),u=o0(u,t),c=a0(c),u=a0(u),t.isRawShaderMaterial!==!0&&(L=`#version 300 es
`,y=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+y,_=["#define varying in",t.glslVersion===yg?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===yg?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+_);const P=L+y+c,T=L+_+u,V=n0(o,o.VERTEX_SHADER,P),I=n0(o,o.FRAGMENT_SHADER,T);o.attachShader(w,V),o.attachShader(w,I),t.index0AttributeName!==void 0?o.bindAttribLocation(w,0,t.index0AttributeName):t.morphTargets===!0&&o.bindAttribLocation(w,0,"position"),o.linkProgram(w);function N(F){if(i.debug.checkShaderErrors){const $=o.getProgramInfoLog(w).trim(),Y=o.getShaderInfoLog(V).trim(),ie=o.getShaderInfoLog(I).trim();let ce=!0,oe=!0;if(o.getProgramParameter(w,o.LINK_STATUS)===!1)if(ce=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(o,w,V,I);else{const ue=r0(o,V,"vertex"),G=r0(o,I,"fragment");console.error("THREE.WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(w,o.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+$+`
`+ue+`
`+G)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(Y===""||ie==="")&&(oe=!1);oe&&(F.diagnostics={runnable:ce,programLog:$,vertexShader:{log:Y,prefix:y},fragmentShader:{log:ie,prefix:_}})}o.deleteShader(V),o.deleteShader(I),z=new Fc(o,w),R=PE(o,w)}let z;this.getUniforms=function(){return z===void 0&&N(this),z};let R;this.getAttributes=function(){return R===void 0&&N(this),R};let A=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=o.getProgramParameter(w,yE)),A},this.destroy=function(){r.releaseStatesOfProgram(this),o.deleteProgram(w),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=SE++,this.cacheKey=e,this.usedTimes=1,this.program=w,this.vertexShader=V,this.fragmentShader=I,this}let HE=0;class VE{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,r=e.fragmentShader,o=this._getShaderStage(t),a=this._getShaderStage(r),c=this._getShaderCacheForMaterial(e);return c.has(o)===!1&&(c.add(o),o.usedTimes++),c.has(a)===!1&&(c.add(a),a.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new GE(e),t.set(e,r)),r}}class GE{constructor(e){this.id=HE++,this.code=e,this.usedTimes=0}}function WE(i,e,t,r,o,a,c){const u=new Av,f=new VE,d=new Set,m=[],g=o.logarithmicDepthBuffer,v=o.vertexTextures;let S=o.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function w(R){return d.add(R),R===0?"uv":`uv${R}`}function y(R,A,F,$,Y){const ie=$.fog,ce=Y.geometry,oe=R.isMeshStandardMaterial?$.environment:null,ue=(R.isMeshStandardMaterial?t:e).get(R.envMap||oe),G=ue&&ue.mapping===Bc?ue.image.height:null,he=M[R.type];R.precision!==null&&(S=o.getMaxPrecision(R.precision),S!==R.precision&&console.warn("THREE.WebGLProgram.getParameters:",R.precision,"not supported, using",S,"instead."));const ae=ce.morphAttributes.position||ce.morphAttributes.normal||ce.morphAttributes.color,k=ae!==void 0?ae.length:0;let ee=0;ce.morphAttributes.position!==void 0&&(ee=1),ce.morphAttributes.normal!==void 0&&(ee=2),ce.morphAttributes.color!==void 0&&(ee=3);let Fe,J,fe,we;if(he){const wt=Vi[he];Fe=wt.vertexShader,J=wt.fragmentShader}else Fe=R.vertexShader,J=R.fragmentShader,f.update(R),fe=f.getVertexShaderID(R),we=f.getFragmentShaderID(R);const ve=i.getRenderTarget(),Ae=i.state.buffers.depth.getReversed(),Be=Y.isInstancedMesh===!0,Ze=Y.isBatchedMesh===!0,_t=!!R.map,_e=!!R.matcap,Re=!!ue,O=!!R.aoMap,Qe=!!R.lightMap,Ee=!!R.bumpMap,Ve=!!R.normalMap,Le=!!R.displacementMap,it=!!R.emissiveMap,Oe=!!R.metalnessMap,D=!!R.roughnessMap,C=R.anisotropy>0,Z=R.clearcoat>0,de=R.dispersion>0,xe=R.iridescence>0,pe=R.sheen>0,qe=R.transmission>0,De=C&&!!R.anisotropyMap,Ge=Z&&!!R.clearcoatMap,pt=Z&&!!R.clearcoatNormalMap,Te=Z&&!!R.clearcoatRoughnessMap,Xe=xe&&!!R.iridescenceMap,ot=xe&&!!R.iridescenceThicknessMap,at=pe&&!!R.sheenColorMap,je=pe&&!!R.sheenRoughnessMap,xt=!!R.specularMap,ft=!!R.specularColorMap,Lt=!!R.specularIntensityMap,X=qe&&!!R.transmissionMap,Ie=qe&&!!R.thicknessMap,le=!!R.gradientMap,me=!!R.alphaMap,ke=R.alphaTest>0,Ue=!!R.alphaHash,dt=!!R.extensions;let Ot=Kr;R.toneMapped&&(ve===null||ve.isXRRenderTarget===!0)&&(Ot=i.toneMapping);const Jt={shaderID:he,shaderType:R.type,shaderName:R.name,vertexShader:Fe,fragmentShader:J,defines:R.defines,customVertexShaderID:fe,customFragmentShaderID:we,isRawShaderMaterial:R.isRawShaderMaterial===!0,glslVersion:R.glslVersion,precision:S,batching:Ze,batchingColor:Ze&&Y._colorsTexture!==null,instancing:Be,instancingColor:Be&&Y.instanceColor!==null,instancingMorph:Be&&Y.morphTexture!==null,supportsVertexTextures:v,outputColorSpace:ve===null?i.outputColorSpace:ve.isXRRenderTarget===!0?ve.texture.colorSpace:Uo,alphaToCoverage:!!R.alphaToCoverage,map:_t,matcap:_e,envMap:Re,envMapMode:Re&&ue.mapping,envMapCubeUVHeight:G,aoMap:O,lightMap:Qe,bumpMap:Ee,normalMap:Ve,displacementMap:v&&Le,emissiveMap:it,normalMapObjectSpace:Ve&&R.normalMapType===Oy,normalMapTangentSpace:Ve&&R.normalMapType===yv,metalnessMap:Oe,roughnessMap:D,anisotropy:C,anisotropyMap:De,clearcoat:Z,clearcoatMap:Ge,clearcoatNormalMap:pt,clearcoatRoughnessMap:Te,dispersion:de,iridescence:xe,iridescenceMap:Xe,iridescenceThicknessMap:ot,sheen:pe,sheenColorMap:at,sheenRoughnessMap:je,specularMap:xt,specularColorMap:ft,specularIntensityMap:Lt,transmission:qe,transmissionMap:X,thicknessMap:Ie,gradientMap:le,opaque:R.transparent===!1&&R.blending===So&&R.alphaToCoverage===!1,alphaMap:me,alphaTest:ke,alphaHash:Ue,combine:R.combine,mapUv:_t&&w(R.map.channel),aoMapUv:O&&w(R.aoMap.channel),lightMapUv:Qe&&w(R.lightMap.channel),bumpMapUv:Ee&&w(R.bumpMap.channel),normalMapUv:Ve&&w(R.normalMap.channel),displacementMapUv:Le&&w(R.displacementMap.channel),emissiveMapUv:it&&w(R.emissiveMap.channel),metalnessMapUv:Oe&&w(R.metalnessMap.channel),roughnessMapUv:D&&w(R.roughnessMap.channel),anisotropyMapUv:De&&w(R.anisotropyMap.channel),clearcoatMapUv:Ge&&w(R.clearcoatMap.channel),clearcoatNormalMapUv:pt&&w(R.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Te&&w(R.clearcoatRoughnessMap.channel),iridescenceMapUv:Xe&&w(R.iridescenceMap.channel),iridescenceThicknessMapUv:ot&&w(R.iridescenceThicknessMap.channel),sheenColorMapUv:at&&w(R.sheenColorMap.channel),sheenRoughnessMapUv:je&&w(R.sheenRoughnessMap.channel),specularMapUv:xt&&w(R.specularMap.channel),specularColorMapUv:ft&&w(R.specularColorMap.channel),specularIntensityMapUv:Lt&&w(R.specularIntensityMap.channel),transmissionMapUv:X&&w(R.transmissionMap.channel),thicknessMapUv:Ie&&w(R.thicknessMap.channel),alphaMapUv:me&&w(R.alphaMap.channel),vertexTangents:!!ce.attributes.tangent&&(Ve||C),vertexColors:R.vertexColors,vertexAlphas:R.vertexColors===!0&&!!ce.attributes.color&&ce.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!ce.attributes.uv&&(_t||me),fog:!!ie,useFog:R.fog===!0,fogExp2:!!ie&&ie.isFogExp2,flatShading:R.flatShading===!0,sizeAttenuation:R.sizeAttenuation===!0,logarithmicDepthBuffer:g,reverseDepthBuffer:Ae,skinning:Y.isSkinnedMesh===!0,morphTargets:ce.morphAttributes.position!==void 0,morphNormals:ce.morphAttributes.normal!==void 0,morphColors:ce.morphAttributes.color!==void 0,morphTargetsCount:k,morphTextureStride:ee,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:R.dithering,shadowMapEnabled:i.shadowMap.enabled&&F.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ot,decodeVideoTexture:_t&&R.map.isVideoTexture===!0&&At.getTransfer(R.map.colorSpace)===Nt,decodeVideoTextureEmissive:it&&R.emissiveMap.isVideoTexture===!0&&At.getTransfer(R.emissiveMap.colorSpace)===Nt,premultipliedAlpha:R.premultipliedAlpha,doubleSided:R.side===gi,flipSided:R.side===On,useDepthPacking:R.depthPacking>=0,depthPacking:R.depthPacking||0,index0AttributeName:R.index0AttributeName,extensionClipCullDistance:dt&&R.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(dt&&R.extensions.multiDraw===!0||Ze)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:R.customProgramCacheKey()};return Jt.vertexUv1s=d.has(1),Jt.vertexUv2s=d.has(2),Jt.vertexUv3s=d.has(3),d.clear(),Jt}function _(R){const A=[];if(R.shaderID?A.push(R.shaderID):(A.push(R.customVertexShaderID),A.push(R.customFragmentShaderID)),R.defines!==void 0)for(const F in R.defines)A.push(F),A.push(R.defines[F]);return R.isRawShaderMaterial===!1&&(L(A,R),P(A,R),A.push(i.outputColorSpace)),A.push(R.customProgramCacheKey),A.join()}function L(R,A){R.push(A.precision),R.push(A.outputColorSpace),R.push(A.envMapMode),R.push(A.envMapCubeUVHeight),R.push(A.mapUv),R.push(A.alphaMapUv),R.push(A.lightMapUv),R.push(A.aoMapUv),R.push(A.bumpMapUv),R.push(A.normalMapUv),R.push(A.displacementMapUv),R.push(A.emissiveMapUv),R.push(A.metalnessMapUv),R.push(A.roughnessMapUv),R.push(A.anisotropyMapUv),R.push(A.clearcoatMapUv),R.push(A.clearcoatNormalMapUv),R.push(A.clearcoatRoughnessMapUv),R.push(A.iridescenceMapUv),R.push(A.iridescenceThicknessMapUv),R.push(A.sheenColorMapUv),R.push(A.sheenRoughnessMapUv),R.push(A.specularMapUv),R.push(A.specularColorMapUv),R.push(A.specularIntensityMapUv),R.push(A.transmissionMapUv),R.push(A.thicknessMapUv),R.push(A.combine),R.push(A.fogExp2),R.push(A.sizeAttenuation),R.push(A.morphTargetsCount),R.push(A.morphAttributeCount),R.push(A.numDirLights),R.push(A.numPointLights),R.push(A.numSpotLights),R.push(A.numSpotLightMaps),R.push(A.numHemiLights),R.push(A.numRectAreaLights),R.push(A.numDirLightShadows),R.push(A.numPointLightShadows),R.push(A.numSpotLightShadows),R.push(A.numSpotLightShadowsWithMaps),R.push(A.numLightProbes),R.push(A.shadowMapType),R.push(A.toneMapping),R.push(A.numClippingPlanes),R.push(A.numClipIntersection),R.push(A.depthPacking)}function P(R,A){u.disableAll(),A.supportsVertexTextures&&u.enable(0),A.instancing&&u.enable(1),A.instancingColor&&u.enable(2),A.instancingMorph&&u.enable(3),A.matcap&&u.enable(4),A.envMap&&u.enable(5),A.normalMapObjectSpace&&u.enable(6),A.normalMapTangentSpace&&u.enable(7),A.clearcoat&&u.enable(8),A.iridescence&&u.enable(9),A.alphaTest&&u.enable(10),A.vertexColors&&u.enable(11),A.vertexAlphas&&u.enable(12),A.vertexUv1s&&u.enable(13),A.vertexUv2s&&u.enable(14),A.vertexUv3s&&u.enable(15),A.vertexTangents&&u.enable(16),A.anisotropy&&u.enable(17),A.alphaHash&&u.enable(18),A.batching&&u.enable(19),A.dispersion&&u.enable(20),A.batchingColor&&u.enable(21),R.push(u.mask),u.disableAll(),A.fog&&u.enable(0),A.useFog&&u.enable(1),A.flatShading&&u.enable(2),A.logarithmicDepthBuffer&&u.enable(3),A.reverseDepthBuffer&&u.enable(4),A.skinning&&u.enable(5),A.morphTargets&&u.enable(6),A.morphNormals&&u.enable(7),A.morphColors&&u.enable(8),A.premultipliedAlpha&&u.enable(9),A.shadowMapEnabled&&u.enable(10),A.doubleSided&&u.enable(11),A.flipSided&&u.enable(12),A.useDepthPacking&&u.enable(13),A.dithering&&u.enable(14),A.transmission&&u.enable(15),A.sheen&&u.enable(16),A.opaque&&u.enable(17),A.pointsUvs&&u.enable(18),A.decodeVideoTexture&&u.enable(19),A.decodeVideoTextureEmissive&&u.enable(20),A.alphaToCoverage&&u.enable(21),R.push(u.mask)}function T(R){const A=M[R.type];let F;if(A){const $=Vi[A];F=CS.clone($.uniforms)}else F=R.uniforms;return F}function V(R,A){let F;for(let $=0,Y=m.length;$<Y;$++){const ie=m[$];if(ie.cacheKey===A){F=ie,++F.usedTimes;break}}return F===void 0&&(F=new BE(i,A,R,a),m.push(F)),F}function I(R){if(--R.usedTimes===0){const A=m.indexOf(R);m[A]=m[m.length-1],m.pop(),R.destroy()}}function N(R){f.remove(R)}function z(){f.dispose()}return{getParameters:y,getProgramCacheKey:_,getUniforms:T,acquireProgram:V,releaseProgram:I,releaseShaderCache:N,programs:m,dispose:z}}function XE(){let i=new WeakMap;function e(c){return i.has(c)}function t(c){let u=i.get(c);return u===void 0&&(u={},i.set(c,u)),u}function r(c){i.delete(c)}function o(c,u,f){i.get(c)[u]=f}function a(){i=new WeakMap}return{has:e,get:t,remove:r,update:o,dispose:a}}function jE(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function c0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function u0(){const i=[];let e=0;const t=[],r=[],o=[];function a(){e=0,t.length=0,r.length=0,o.length=0}function c(g,v,S,M,w,y){let _=i[e];return _===void 0?(_={id:g.id,object:g,geometry:v,material:S,groupOrder:M,renderOrder:g.renderOrder,z:w,group:y},i[e]=_):(_.id=g.id,_.object=g,_.geometry=v,_.material=S,_.groupOrder=M,_.renderOrder=g.renderOrder,_.z=w,_.group=y),e++,_}function u(g,v,S,M,w,y){const _=c(g,v,S,M,w,y);S.transmission>0?r.push(_):S.transparent===!0?o.push(_):t.push(_)}function f(g,v,S,M,w,y){const _=c(g,v,S,M,w,y);S.transmission>0?r.unshift(_):S.transparent===!0?o.unshift(_):t.unshift(_)}function d(g,v){t.length>1&&t.sort(g||jE),r.length>1&&r.sort(v||c0),o.length>1&&o.sort(v||c0)}function m(){for(let g=e,v=i.length;g<v;g++){const S=i[g];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:r,transparent:o,init:a,push:u,unshift:f,finish:m,sort:d}}function YE(){let i=new WeakMap;function e(r,o){const a=i.get(r);let c;return a===void 0?(c=new u0,i.set(r,[c])):o>=a.length?(c=new u0,a.push(c)):c=a[o],c}function t(){i=new WeakMap}return{get:e,dispose:t}}function qE(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new B,color:new ht};break;case"SpotLight":t={position:new B,direction:new B,color:new ht,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new ht,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new ht,groundColor:new ht};break;case"RectAreaLight":t={color:new ht,position:new B,halfWidth:new B,halfHeight:new B};break}return i[e.id]=t,t}}}function KE(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let $E=0;function ZE(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function QE(i){const e=new qE,t=KE(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let d=0;d<9;d++)r.probe.push(new B);const o=new B,a=new It,c=new It;function u(d){let m=0,g=0,v=0;for(let R=0;R<9;R++)r.probe[R].set(0,0,0);let S=0,M=0,w=0,y=0,_=0,L=0,P=0,T=0,V=0,I=0,N=0;d.sort(ZE);for(let R=0,A=d.length;R<A;R++){const F=d[R],$=F.color,Y=F.intensity,ie=F.distance,ce=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)m+=$.r*Y,g+=$.g*Y,v+=$.b*Y;else if(F.isLightProbe){for(let oe=0;oe<9;oe++)r.probe[oe].addScaledVector(F.sh.coefficients[oe],Y);N++}else if(F.isDirectionalLight){const oe=e.get(F);if(oe.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const ue=F.shadow,G=t.get(F);G.shadowIntensity=ue.intensity,G.shadowBias=ue.bias,G.shadowNormalBias=ue.normalBias,G.shadowRadius=ue.radius,G.shadowMapSize=ue.mapSize,r.directionalShadow[S]=G,r.directionalShadowMap[S]=ce,r.directionalShadowMatrix[S]=F.shadow.matrix,L++}r.directional[S]=oe,S++}else if(F.isSpotLight){const oe=e.get(F);oe.position.setFromMatrixPosition(F.matrixWorld),oe.color.copy($).multiplyScalar(Y),oe.distance=ie,oe.coneCos=Math.cos(F.angle),oe.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),oe.decay=F.decay,r.spot[w]=oe;const ue=F.shadow;if(F.map&&(r.spotLightMap[V]=F.map,V++,ue.updateMatrices(F),F.castShadow&&I++),r.spotLightMatrix[w]=ue.matrix,F.castShadow){const G=t.get(F);G.shadowIntensity=ue.intensity,G.shadowBias=ue.bias,G.shadowNormalBias=ue.normalBias,G.shadowRadius=ue.radius,G.shadowMapSize=ue.mapSize,r.spotShadow[w]=G,r.spotShadowMap[w]=ce,T++}w++}else if(F.isRectAreaLight){const oe=e.get(F);oe.color.copy($).multiplyScalar(Y),oe.halfWidth.set(F.width*.5,0,0),oe.halfHeight.set(0,F.height*.5,0),r.rectArea[y]=oe,y++}else if(F.isPointLight){const oe=e.get(F);if(oe.color.copy(F.color).multiplyScalar(F.intensity),oe.distance=F.distance,oe.decay=F.decay,F.castShadow){const ue=F.shadow,G=t.get(F);G.shadowIntensity=ue.intensity,G.shadowBias=ue.bias,G.shadowNormalBias=ue.normalBias,G.shadowRadius=ue.radius,G.shadowMapSize=ue.mapSize,G.shadowCameraNear=ue.camera.near,G.shadowCameraFar=ue.camera.far,r.pointShadow[M]=G,r.pointShadowMap[M]=ce,r.pointShadowMatrix[M]=F.shadow.matrix,P++}r.point[M]=oe,M++}else if(F.isHemisphereLight){const oe=e.get(F);oe.skyColor.copy(F.color).multiplyScalar(Y),oe.groundColor.copy(F.groundColor).multiplyScalar(Y),r.hemi[_]=oe,_++}}y>0&&(i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Ne.LTC_FLOAT_1,r.rectAreaLTC2=Ne.LTC_FLOAT_2):(r.rectAreaLTC1=Ne.LTC_HALF_1,r.rectAreaLTC2=Ne.LTC_HALF_2)),r.ambient[0]=m,r.ambient[1]=g,r.ambient[2]=v;const z=r.hash;(z.directionalLength!==S||z.pointLength!==M||z.spotLength!==w||z.rectAreaLength!==y||z.hemiLength!==_||z.numDirectionalShadows!==L||z.numPointShadows!==P||z.numSpotShadows!==T||z.numSpotMaps!==V||z.numLightProbes!==N)&&(r.directional.length=S,r.spot.length=w,r.rectArea.length=y,r.point.length=M,r.hemi.length=_,r.directionalShadow.length=L,r.directionalShadowMap.length=L,r.pointShadow.length=P,r.pointShadowMap.length=P,r.spotShadow.length=T,r.spotShadowMap.length=T,r.directionalShadowMatrix.length=L,r.pointShadowMatrix.length=P,r.spotLightMatrix.length=T+V-I,r.spotLightMap.length=V,r.numSpotLightShadowsWithMaps=I,r.numLightProbes=N,z.directionalLength=S,z.pointLength=M,z.spotLength=w,z.rectAreaLength=y,z.hemiLength=_,z.numDirectionalShadows=L,z.numPointShadows=P,z.numSpotShadows=T,z.numSpotMaps=V,z.numLightProbes=N,r.version=$E++)}function f(d,m){let g=0,v=0,S=0,M=0,w=0;const y=m.matrixWorldInverse;for(let _=0,L=d.length;_<L;_++){const P=d[_];if(P.isDirectionalLight){const T=r.directional[g];T.direction.setFromMatrixPosition(P.matrixWorld),o.setFromMatrixPosition(P.target.matrixWorld),T.direction.sub(o),T.direction.transformDirection(y),g++}else if(P.isSpotLight){const T=r.spot[S];T.position.setFromMatrixPosition(P.matrixWorld),T.position.applyMatrix4(y),T.direction.setFromMatrixPosition(P.matrixWorld),o.setFromMatrixPosition(P.target.matrixWorld),T.direction.sub(o),T.direction.transformDirection(y),S++}else if(P.isRectAreaLight){const T=r.rectArea[M];T.position.setFromMatrixPosition(P.matrixWorld),T.position.applyMatrix4(y),c.identity(),a.copy(P.matrixWorld),a.premultiply(y),c.extractRotation(a),T.halfWidth.set(P.width*.5,0,0),T.halfHeight.set(0,P.height*.5,0),T.halfWidth.applyMatrix4(c),T.halfHeight.applyMatrix4(c),M++}else if(P.isPointLight){const T=r.point[v];T.position.setFromMatrixPosition(P.matrixWorld),T.position.applyMatrix4(y),v++}else if(P.isHemisphereLight){const T=r.hemi[w];T.direction.setFromMatrixPosition(P.matrixWorld),T.direction.transformDirection(y),w++}}}return{setup:u,setupView:f,state:r}}function h0(i){const e=new QE(i),t=[],r=[];function o(m){d.camera=m,t.length=0,r.length=0}function a(m){t.push(m)}function c(m){r.push(m)}function u(){e.setup(t)}function f(m){e.setupView(t,m)}const d={lightsArray:t,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:o,state:d,setupLights:u,setupLightsView:f,pushLight:a,pushShadow:c}}function JE(i){let e=new WeakMap;function t(o,a=0){const c=e.get(o);let u;return c===void 0?(u=new h0(i),e.set(o,[u])):a>=c.length?(u=new h0(i),c.push(u)):u=c[a],u}function r(){e=new WeakMap}return{get:t,dispose:r}}class eT extends ko{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Uy,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class tT extends ko{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const nT=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,iT=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function rT(i,e,t){let r=new Rd;const o=new ze,a=new ze,c=new jt,u=new eT({depthPacking:Fy}),f=new tT,d={},m=t.maxTextureSize,g={[$r]:On,[On]:$r,[gi]:gi},v=new vr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ze},radius:{value:4}},vertexShader:nT,fragmentShader:iT}),S=v.clone();S.defines.HORIZONTAL_PASS=1;const M=new _i;M.setAttribute("position",new ri(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const w=new Pt(M,v),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=av;let _=this.type;this.render=function(I,N,z){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||I.length===0)return;const R=i.getRenderTarget(),A=i.getActiveCubeFace(),F=i.getActiveMipmapLevel(),$=i.state;$.setBlending(qr),$.buffers.color.setClear(1,1,1,1),$.buffers.depth.setTest(!0),$.setScissorTest(!1);const Y=_!==ur&&this.type===ur,ie=_===ur&&this.type!==ur;for(let ce=0,oe=I.length;ce<oe;ce++){const ue=I[ce],G=ue.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",ue,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;o.copy(G.mapSize);const he=G.getFrameExtents();if(o.multiply(he),a.copy(G.mapSize),(o.x>m||o.y>m)&&(o.x>m&&(a.x=Math.floor(m/he.x),o.x=a.x*he.x,G.mapSize.x=a.x),o.y>m&&(a.y=Math.floor(m/he.y),o.y=a.y*he.y,G.mapSize.y=a.y)),G.map===null||Y===!0||ie===!0){const k=this.type!==ur?{minFilter:ii,magFilter:ii}:{};G.map!==null&&G.map.dispose(),G.map=new Ts(o.x,o.y,k),G.map.texture.name=ue.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();const ae=G.getViewportCount();for(let k=0;k<ae;k++){const ee=G.getViewport(k);c.set(a.x*ee.x,a.y*ee.y,a.x*ee.z,a.y*ee.w),$.viewport(c),G.updateMatrices(ue,k),r=G.getFrustum(),T(N,z,G.camera,ue,this.type)}G.isPointLightShadow!==!0&&this.type===ur&&L(G,z),G.needsUpdate=!1}_=this.type,y.needsUpdate=!1,i.setRenderTarget(R,A,F)};function L(I,N){const z=e.update(w);v.defines.VSM_SAMPLES!==I.blurSamples&&(v.defines.VSM_SAMPLES=I.blurSamples,S.defines.VSM_SAMPLES=I.blurSamples,v.needsUpdate=!0,S.needsUpdate=!0),I.mapPass===null&&(I.mapPass=new Ts(o.x,o.y)),v.uniforms.shadow_pass.value=I.map.texture,v.uniforms.resolution.value=I.mapSize,v.uniforms.radius.value=I.radius,i.setRenderTarget(I.mapPass),i.clear(),i.renderBufferDirect(N,null,z,v,w,null),S.uniforms.shadow_pass.value=I.mapPass.texture,S.uniforms.resolution.value=I.mapSize,S.uniforms.radius.value=I.radius,i.setRenderTarget(I.map),i.clear(),i.renderBufferDirect(N,null,z,S,w,null)}function P(I,N,z,R){let A=null;const F=z.isPointLight===!0?I.customDistanceMaterial:I.customDepthMaterial;if(F!==void 0)A=F;else if(A=z.isPointLight===!0?f:u,i.localClippingEnabled&&N.clipShadows===!0&&Array.isArray(N.clippingPlanes)&&N.clippingPlanes.length!==0||N.displacementMap&&N.displacementScale!==0||N.alphaMap&&N.alphaTest>0||N.map&&N.alphaTest>0){const $=A.uuid,Y=N.uuid;let ie=d[$];ie===void 0&&(ie={},d[$]=ie);let ce=ie[Y];ce===void 0&&(ce=A.clone(),ie[Y]=ce,N.addEventListener("dispose",V)),A=ce}if(A.visible=N.visible,A.wireframe=N.wireframe,R===ur?A.side=N.shadowSide!==null?N.shadowSide:N.side:A.side=N.shadowSide!==null?N.shadowSide:g[N.side],A.alphaMap=N.alphaMap,A.alphaTest=N.alphaTest,A.map=N.map,A.clipShadows=N.clipShadows,A.clippingPlanes=N.clippingPlanes,A.clipIntersection=N.clipIntersection,A.displacementMap=N.displacementMap,A.displacementScale=N.displacementScale,A.displacementBias=N.displacementBias,A.wireframeLinewidth=N.wireframeLinewidth,A.linewidth=N.linewidth,z.isPointLight===!0&&A.isMeshDistanceMaterial===!0){const $=i.properties.get(A);$.light=z}return A}function T(I,N,z,R,A){if(I.visible===!1)return;if(I.layers.test(N.layers)&&(I.isMesh||I.isLine||I.isPoints)&&(I.castShadow||I.receiveShadow&&A===ur)&&(!I.frustumCulled||r.intersectsObject(I))){I.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,I.matrixWorld);const Y=e.update(I),ie=I.material;if(Array.isArray(ie)){const ce=Y.groups;for(let oe=0,ue=ce.length;oe<ue;oe++){const G=ce[oe],he=ie[G.materialIndex];if(he&&he.visible){const ae=P(I,he,R,A);I.onBeforeShadow(i,I,N,z,Y,ae,G),i.renderBufferDirect(z,null,Y,ae,I,G),I.onAfterShadow(i,I,N,z,Y,ae,G)}}}else if(ie.visible){const ce=P(I,ie,R,A);I.onBeforeShadow(i,I,N,z,Y,ce,null),i.renderBufferDirect(z,null,Y,ce,I,null),I.onAfterShadow(i,I,N,z,Y,ce,null)}}const $=I.children;for(let Y=0,ie=$.length;Y<ie;Y++)T($[Y],N,z,R,A)}function V(I){I.target.removeEventListener("dispose",V);for(const z in d){const R=d[z],A=I.target.uuid;A in R&&(R[A].dispose(),delete R[A])}}}const sT={[Tf]:Af,[Cf]:bf,[Rf]:Lf,[Co]:Pf,[Af]:Tf,[bf]:Cf,[Lf]:Rf,[Pf]:Co};function oT(i,e){function t(){let X=!1;const Ie=new jt;let le=null;const me=new jt(0,0,0,0);return{setMask:function(ke){le!==ke&&!X&&(i.colorMask(ke,ke,ke,ke),le=ke)},setLocked:function(ke){X=ke},setClear:function(ke,Ue,dt,Ot,Jt){Jt===!0&&(ke*=Ot,Ue*=Ot,dt*=Ot),Ie.set(ke,Ue,dt,Ot),me.equals(Ie)===!1&&(i.clearColor(ke,Ue,dt,Ot),me.copy(Ie))},reset:function(){X=!1,le=null,me.set(-1,0,0,0)}}}function r(){let X=!1,Ie=!1,le=null,me=null,ke=null;return{setReversed:function(Ue){if(Ie!==Ue){const dt=e.get("EXT_clip_control");Ie?dt.clipControlEXT(dt.LOWER_LEFT_EXT,dt.ZERO_TO_ONE_EXT):dt.clipControlEXT(dt.LOWER_LEFT_EXT,dt.NEGATIVE_ONE_TO_ONE_EXT);const Ot=ke;ke=null,this.setClear(Ot)}Ie=Ue},getReversed:function(){return Ie},setTest:function(Ue){Ue?ve(i.DEPTH_TEST):Ae(i.DEPTH_TEST)},setMask:function(Ue){le!==Ue&&!X&&(i.depthMask(Ue),le=Ue)},setFunc:function(Ue){if(Ie&&(Ue=sT[Ue]),me!==Ue){switch(Ue){case Tf:i.depthFunc(i.NEVER);break;case Af:i.depthFunc(i.ALWAYS);break;case Cf:i.depthFunc(i.LESS);break;case Co:i.depthFunc(i.LEQUAL);break;case Rf:i.depthFunc(i.EQUAL);break;case Pf:i.depthFunc(i.GEQUAL);break;case bf:i.depthFunc(i.GREATER);break;case Lf:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}me=Ue}},setLocked:function(Ue){X=Ue},setClear:function(Ue){ke!==Ue&&(Ie&&(Ue=1-Ue),i.clearDepth(Ue),ke=Ue)},reset:function(){X=!1,le=null,me=null,ke=null,Ie=!1}}}function o(){let X=!1,Ie=null,le=null,me=null,ke=null,Ue=null,dt=null,Ot=null,Jt=null;return{setTest:function(wt){X||(wt?ve(i.STENCIL_TEST):Ae(i.STENCIL_TEST))},setMask:function(wt){Ie!==wt&&!X&&(i.stencilMask(wt),Ie=wt)},setFunc:function(wt,Bn,bn){(le!==wt||me!==Bn||ke!==bn)&&(i.stencilFunc(wt,Bn,bn),le=wt,me=Bn,ke=bn)},setOp:function(wt,Bn,bn){(Ue!==wt||dt!==Bn||Ot!==bn)&&(i.stencilOp(wt,Bn,bn),Ue=wt,dt=Bn,Ot=bn)},setLocked:function(wt){X=wt},setClear:function(wt){Jt!==wt&&(i.clearStencil(wt),Jt=wt)},reset:function(){X=!1,Ie=null,le=null,me=null,ke=null,Ue=null,dt=null,Ot=null,Jt=null}}}const a=new t,c=new r,u=new o,f=new WeakMap,d=new WeakMap;let m={},g={},v=new WeakMap,S=[],M=null,w=!1,y=null,_=null,L=null,P=null,T=null,V=null,I=null,N=new ht(0,0,0),z=0,R=!1,A=null,F=null,$=null,Y=null,ie=null;const ce=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let oe=!1,ue=0;const G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(ue=parseFloat(/^WebGL (\d)/.exec(G)[1]),oe=ue>=1):G.indexOf("OpenGL ES")!==-1&&(ue=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),oe=ue>=2);let he=null,ae={};const k=i.getParameter(i.SCISSOR_BOX),ee=i.getParameter(i.VIEWPORT),Fe=new jt().fromArray(k),J=new jt().fromArray(ee);function fe(X,Ie,le,me){const ke=new Uint8Array(4),Ue=i.createTexture();i.bindTexture(X,Ue),i.texParameteri(X,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(X,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let dt=0;dt<le;dt++)X===i.TEXTURE_3D||X===i.TEXTURE_2D_ARRAY?i.texImage3D(Ie,0,i.RGBA,1,1,me,0,i.RGBA,i.UNSIGNED_BYTE,ke):i.texImage2D(Ie+dt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ke);return Ue}const we={};we[i.TEXTURE_2D]=fe(i.TEXTURE_2D,i.TEXTURE_2D,1),we[i.TEXTURE_CUBE_MAP]=fe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),we[i.TEXTURE_2D_ARRAY]=fe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),we[i.TEXTURE_3D]=fe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),a.setClear(0,0,0,1),c.setClear(1),u.setClear(0),ve(i.DEPTH_TEST),c.setFunc(Co),Ee(!1),Ve(mg),ve(i.CULL_FACE),O(qr);function ve(X){m[X]!==!0&&(i.enable(X),m[X]=!0)}function Ae(X){m[X]!==!1&&(i.disable(X),m[X]=!1)}function Be(X,Ie){return g[X]!==Ie?(i.bindFramebuffer(X,Ie),g[X]=Ie,X===i.DRAW_FRAMEBUFFER&&(g[i.FRAMEBUFFER]=Ie),X===i.FRAMEBUFFER&&(g[i.DRAW_FRAMEBUFFER]=Ie),!0):!1}function Ze(X,Ie){let le=S,me=!1;if(X){le=v.get(Ie),le===void 0&&(le=[],v.set(Ie,le));const ke=X.textures;if(le.length!==ke.length||le[0]!==i.COLOR_ATTACHMENT0){for(let Ue=0,dt=ke.length;Ue<dt;Ue++)le[Ue]=i.COLOR_ATTACHMENT0+Ue;le.length=ke.length,me=!0}}else le[0]!==i.BACK&&(le[0]=i.BACK,me=!0);me&&i.drawBuffers(le)}function _t(X){return M!==X?(i.useProgram(X),M=X,!0):!1}const _e={[ys]:i.FUNC_ADD,[ly]:i.FUNC_SUBTRACT,[cy]:i.FUNC_REVERSE_SUBTRACT};_e[uy]=i.MIN,_e[hy]=i.MAX;const Re={[fy]:i.ZERO,[dy]:i.ONE,[py]:i.SRC_COLOR,[wf]:i.SRC_ALPHA,[yy]:i.SRC_ALPHA_SATURATE,[_y]:i.DST_COLOR,[gy]:i.DST_ALPHA,[my]:i.ONE_MINUS_SRC_COLOR,[Ef]:i.ONE_MINUS_SRC_ALPHA,[xy]:i.ONE_MINUS_DST_COLOR,[vy]:i.ONE_MINUS_DST_ALPHA,[Sy]:i.CONSTANT_COLOR,[My]:i.ONE_MINUS_CONSTANT_COLOR,[wy]:i.CONSTANT_ALPHA,[Ey]:i.ONE_MINUS_CONSTANT_ALPHA};function O(X,Ie,le,me,ke,Ue,dt,Ot,Jt,wt){if(X===qr){w===!0&&(Ae(i.BLEND),w=!1);return}if(w===!1&&(ve(i.BLEND),w=!0),X!==ay){if(X!==y||wt!==R){if((_!==ys||T!==ys)&&(i.blendEquation(i.FUNC_ADD),_=ys,T=ys),wt)switch(X){case So:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Mo:i.blendFunc(i.ONE,i.ONE);break;case gg:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case vg:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",X);break}else switch(X){case So:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Mo:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case gg:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case vg:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",X);break}L=null,P=null,V=null,I=null,N.set(0,0,0),z=0,y=X,R=wt}return}ke=ke||Ie,Ue=Ue||le,dt=dt||me,(Ie!==_||ke!==T)&&(i.blendEquationSeparate(_e[Ie],_e[ke]),_=Ie,T=ke),(le!==L||me!==P||Ue!==V||dt!==I)&&(i.blendFuncSeparate(Re[le],Re[me],Re[Ue],Re[dt]),L=le,P=me,V=Ue,I=dt),(Ot.equals(N)===!1||Jt!==z)&&(i.blendColor(Ot.r,Ot.g,Ot.b,Jt),N.copy(Ot),z=Jt),y=X,R=!1}function Qe(X,Ie){X.side===gi?Ae(i.CULL_FACE):ve(i.CULL_FACE);let le=X.side===On;Ie&&(le=!le),Ee(le),X.blending===So&&X.transparent===!1?O(qr):O(X.blending,X.blendEquation,X.blendSrc,X.blendDst,X.blendEquationAlpha,X.blendSrcAlpha,X.blendDstAlpha,X.blendColor,X.blendAlpha,X.premultipliedAlpha),c.setFunc(X.depthFunc),c.setTest(X.depthTest),c.setMask(X.depthWrite),a.setMask(X.colorWrite);const me=X.stencilWrite;u.setTest(me),me&&(u.setMask(X.stencilWriteMask),u.setFunc(X.stencilFunc,X.stencilRef,X.stencilFuncMask),u.setOp(X.stencilFail,X.stencilZFail,X.stencilZPass)),it(X.polygonOffset,X.polygonOffsetFactor,X.polygonOffsetUnits),X.alphaToCoverage===!0?ve(i.SAMPLE_ALPHA_TO_COVERAGE):Ae(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ee(X){A!==X&&(X?i.frontFace(i.CW):i.frontFace(i.CCW),A=X)}function Ve(X){X!==sy?(ve(i.CULL_FACE),X!==F&&(X===mg?i.cullFace(i.BACK):X===oy?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ae(i.CULL_FACE),F=X}function Le(X){X!==$&&(oe&&i.lineWidth(X),$=X)}function it(X,Ie,le){X?(ve(i.POLYGON_OFFSET_FILL),(Y!==Ie||ie!==le)&&(i.polygonOffset(Ie,le),Y=Ie,ie=le)):Ae(i.POLYGON_OFFSET_FILL)}function Oe(X){X?ve(i.SCISSOR_TEST):Ae(i.SCISSOR_TEST)}function D(X){X===void 0&&(X=i.TEXTURE0+ce-1),he!==X&&(i.activeTexture(X),he=X)}function C(X,Ie,le){le===void 0&&(he===null?le=i.TEXTURE0+ce-1:le=he);let me=ae[le];me===void 0&&(me={type:void 0,texture:void 0},ae[le]=me),(me.type!==X||me.texture!==Ie)&&(he!==le&&(i.activeTexture(le),he=le),i.bindTexture(X,Ie||we[X]),me.type=X,me.texture=Ie)}function Z(){const X=ae[he];X!==void 0&&X.type!==void 0&&(i.bindTexture(X.type,null),X.type=void 0,X.texture=void 0)}function de(){try{i.compressedTexImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function xe(){try{i.compressedTexImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function pe(){try{i.texSubImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function qe(){try{i.texSubImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function De(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function Ge(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function pt(){try{i.texStorage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function Te(){try{i.texStorage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function Xe(){try{i.texImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function ot(){try{i.texImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function at(X){Fe.equals(X)===!1&&(i.scissor(X.x,X.y,X.z,X.w),Fe.copy(X))}function je(X){J.equals(X)===!1&&(i.viewport(X.x,X.y,X.z,X.w),J.copy(X))}function xt(X,Ie){let le=d.get(Ie);le===void 0&&(le=new WeakMap,d.set(Ie,le));let me=le.get(X);me===void 0&&(me=i.getUniformBlockIndex(Ie,X.name),le.set(X,me))}function ft(X,Ie){const me=d.get(Ie).get(X);f.get(Ie)!==me&&(i.uniformBlockBinding(Ie,me,X.__bindingPointIndex),f.set(Ie,me))}function Lt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),c.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),m={},he=null,ae={},g={},v=new WeakMap,S=[],M=null,w=!1,y=null,_=null,L=null,P=null,T=null,V=null,I=null,N=new ht(0,0,0),z=0,R=!1,A=null,F=null,$=null,Y=null,ie=null,Fe.set(0,0,i.canvas.width,i.canvas.height),J.set(0,0,i.canvas.width,i.canvas.height),a.reset(),c.reset(),u.reset()}return{buffers:{color:a,depth:c,stencil:u},enable:ve,disable:Ae,bindFramebuffer:Be,drawBuffers:Ze,useProgram:_t,setBlending:O,setMaterial:Qe,setFlipSided:Ee,setCullFace:Ve,setLineWidth:Le,setPolygonOffset:it,setScissorTest:Oe,activeTexture:D,bindTexture:C,unbindTexture:Z,compressedTexImage2D:de,compressedTexImage3D:xe,texImage2D:Xe,texImage3D:ot,updateUBOMapping:xt,uniformBlockBinding:ft,texStorage2D:pt,texStorage3D:Te,texSubImage2D:pe,texSubImage3D:qe,compressedTexSubImage2D:De,compressedTexSubImage3D:Ge,scissor:at,viewport:je,reset:Lt}}function f0(i,e,t,r){const o=aT(r);switch(t){case pv:return i*e;case gv:return i*e;case vv:return i*e*2;case wd:return i*e/o.components*o.byteLength;case Ed:return i*e/o.components*o.byteLength;case _v:return i*e*2/o.components*o.byteLength;case Td:return i*e*2/o.components*o.byteLength;case mv:return i*e*3/o.components*o.byteLength;case Li:return i*e*4/o.components*o.byteLength;case Ad:return i*e*4/o.components*o.byteLength;case Lc:case Dc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ic:case Nc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ff:case kf:return Math.max(i,16)*Math.max(e,8)/4;case Uf:case Of:return Math.max(i,8)*Math.max(e,8)/2;case zf:case Bf:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Hf:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Vf:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Gf:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Wf:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Xf:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case jf:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Yf:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case qf:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Kf:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case $f:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Zf:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Qf:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Jf:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ed:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case td:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Uc:case nd:case id:return Math.ceil(i/4)*Math.ceil(e/4)*16;case xv:case rd:return Math.ceil(i/4)*Math.ceil(e/4)*8;case sd:case od:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function aT(i){switch(i){case gr:case hv:return{byteLength:1,components:1};case ka:case fv:case Wa:return{byteLength:2,components:1};case Sd:case Md:return{byteLength:2,components:4};case Es:case yd:case Xi:return{byteLength:4,components:1};case dv:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function lT(i,e,t,r,o,a,c){const u=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,f=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),d=new ze,m=new WeakMap;let g;const v=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(D,C){return S?new OffscreenCanvas(D,C):kc("canvas")}function w(D,C,Z){let de=1;const xe=Oe(D);if((xe.width>Z||xe.height>Z)&&(de=Z/Math.max(xe.width,xe.height)),de<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const pe=Math.floor(de*xe.width),qe=Math.floor(de*xe.height);g===void 0&&(g=M(pe,qe));const De=C?M(pe,qe):g;return De.width=pe,De.height=qe,De.getContext("2d").drawImage(D,0,0,pe,qe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+xe.width+"x"+xe.height+") to ("+pe+"x"+qe+")."),De}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+xe.width+"x"+xe.height+")."),D;return D}function y(D){return D.generateMipmaps}function _(D){i.generateMipmap(D)}function L(D){return D.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?i.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function P(D,C,Z,de,xe=!1){if(D!==null){if(i[D]!==void 0)return i[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let pe=C;if(C===i.RED&&(Z===i.FLOAT&&(pe=i.R32F),Z===i.HALF_FLOAT&&(pe=i.R16F),Z===i.UNSIGNED_BYTE&&(pe=i.R8)),C===i.RED_INTEGER&&(Z===i.UNSIGNED_BYTE&&(pe=i.R8UI),Z===i.UNSIGNED_SHORT&&(pe=i.R16UI),Z===i.UNSIGNED_INT&&(pe=i.R32UI),Z===i.BYTE&&(pe=i.R8I),Z===i.SHORT&&(pe=i.R16I),Z===i.INT&&(pe=i.R32I)),C===i.RG&&(Z===i.FLOAT&&(pe=i.RG32F),Z===i.HALF_FLOAT&&(pe=i.RG16F),Z===i.UNSIGNED_BYTE&&(pe=i.RG8)),C===i.RG_INTEGER&&(Z===i.UNSIGNED_BYTE&&(pe=i.RG8UI),Z===i.UNSIGNED_SHORT&&(pe=i.RG16UI),Z===i.UNSIGNED_INT&&(pe=i.RG32UI),Z===i.BYTE&&(pe=i.RG8I),Z===i.SHORT&&(pe=i.RG16I),Z===i.INT&&(pe=i.RG32I)),C===i.RGB_INTEGER&&(Z===i.UNSIGNED_BYTE&&(pe=i.RGB8UI),Z===i.UNSIGNED_SHORT&&(pe=i.RGB16UI),Z===i.UNSIGNED_INT&&(pe=i.RGB32UI),Z===i.BYTE&&(pe=i.RGB8I),Z===i.SHORT&&(pe=i.RGB16I),Z===i.INT&&(pe=i.RGB32I)),C===i.RGBA_INTEGER&&(Z===i.UNSIGNED_BYTE&&(pe=i.RGBA8UI),Z===i.UNSIGNED_SHORT&&(pe=i.RGBA16UI),Z===i.UNSIGNED_INT&&(pe=i.RGBA32UI),Z===i.BYTE&&(pe=i.RGBA8I),Z===i.SHORT&&(pe=i.RGBA16I),Z===i.INT&&(pe=i.RGBA32I)),C===i.RGB&&Z===i.UNSIGNED_INT_5_9_9_9_REV&&(pe=i.RGB9_E5),C===i.RGBA){const qe=xe?Hc:At.getTransfer(de);Z===i.FLOAT&&(pe=i.RGBA32F),Z===i.HALF_FLOAT&&(pe=i.RGBA16F),Z===i.UNSIGNED_BYTE&&(pe=qe===Nt?i.SRGB8_ALPHA8:i.RGBA8),Z===i.UNSIGNED_SHORT_4_4_4_4&&(pe=i.RGBA4),Z===i.UNSIGNED_SHORT_5_5_5_1&&(pe=i.RGB5_A1)}return(pe===i.R16F||pe===i.R32F||pe===i.RG16F||pe===i.RG32F||pe===i.RGBA16F||pe===i.RGBA32F)&&e.get("EXT_color_buffer_float"),pe}function T(D,C){let Z;return D?C===null||C===Es||C===bo?Z=i.DEPTH24_STENCIL8:C===Xi?Z=i.DEPTH32F_STENCIL8:C===ka&&(Z=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):C===null||C===Es||C===bo?Z=i.DEPTH_COMPONENT24:C===Xi?Z=i.DEPTH_COMPONENT32F:C===ka&&(Z=i.DEPTH_COMPONENT16),Z}function V(D,C){return y(D)===!0||D.isFramebufferTexture&&D.minFilter!==ii&&D.minFilter!==Wi?Math.log2(Math.max(C.width,C.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?C.mipmaps.length:1}function I(D){const C=D.target;C.removeEventListener("dispose",I),z(C),C.isVideoTexture&&m.delete(C)}function N(D){const C=D.target;C.removeEventListener("dispose",N),A(C)}function z(D){const C=r.get(D);if(C.__webglInit===void 0)return;const Z=D.source,de=v.get(Z);if(de){const xe=de[C.__cacheKey];xe.usedTimes--,xe.usedTimes===0&&R(D),Object.keys(de).length===0&&v.delete(Z)}r.remove(D)}function R(D){const C=r.get(D);i.deleteTexture(C.__webglTexture);const Z=D.source,de=v.get(Z);delete de[C.__cacheKey],c.memory.textures--}function A(D){const C=r.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),r.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let de=0;de<6;de++){if(Array.isArray(C.__webglFramebuffer[de]))for(let xe=0;xe<C.__webglFramebuffer[de].length;xe++)i.deleteFramebuffer(C.__webglFramebuffer[de][xe]);else i.deleteFramebuffer(C.__webglFramebuffer[de]);C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer[de])}else{if(Array.isArray(C.__webglFramebuffer))for(let de=0;de<C.__webglFramebuffer.length;de++)i.deleteFramebuffer(C.__webglFramebuffer[de]);else i.deleteFramebuffer(C.__webglFramebuffer);if(C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer),C.__webglMultisampledFramebuffer&&i.deleteFramebuffer(C.__webglMultisampledFramebuffer),C.__webglColorRenderbuffer)for(let de=0;de<C.__webglColorRenderbuffer.length;de++)C.__webglColorRenderbuffer[de]&&i.deleteRenderbuffer(C.__webglColorRenderbuffer[de]);C.__webglDepthRenderbuffer&&i.deleteRenderbuffer(C.__webglDepthRenderbuffer)}const Z=D.textures;for(let de=0,xe=Z.length;de<xe;de++){const pe=r.get(Z[de]);pe.__webglTexture&&(i.deleteTexture(pe.__webglTexture),c.memory.textures--),r.remove(Z[de])}r.remove(D)}let F=0;function $(){F=0}function Y(){const D=F;return D>=o.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+o.maxTextures),F+=1,D}function ie(D){const C=[];return C.push(D.wrapS),C.push(D.wrapT),C.push(D.wrapR||0),C.push(D.magFilter),C.push(D.minFilter),C.push(D.anisotropy),C.push(D.internalFormat),C.push(D.format),C.push(D.type),C.push(D.generateMipmaps),C.push(D.premultiplyAlpha),C.push(D.flipY),C.push(D.unpackAlignment),C.push(D.colorSpace),C.join()}function ce(D,C){const Z=r.get(D);if(D.isVideoTexture&&Le(D),D.isRenderTargetTexture===!1&&D.version>0&&Z.__version!==D.version){const de=D.image;if(de===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(de.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J(Z,D,C);return}}t.bindTexture(i.TEXTURE_2D,Z.__webglTexture,i.TEXTURE0+C)}function oe(D,C){const Z=r.get(D);if(D.version>0&&Z.__version!==D.version){J(Z,D,C);return}t.bindTexture(i.TEXTURE_2D_ARRAY,Z.__webglTexture,i.TEXTURE0+C)}function ue(D,C){const Z=r.get(D);if(D.version>0&&Z.__version!==D.version){J(Z,D,C);return}t.bindTexture(i.TEXTURE_3D,Z.__webglTexture,i.TEXTURE0+C)}function G(D,C){const Z=r.get(D);if(D.version>0&&Z.__version!==D.version){fe(Z,D,C);return}t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture,i.TEXTURE0+C)}const he={[Oa]:i.REPEAT,[Ms]:i.CLAMP_TO_EDGE,[Nf]:i.MIRRORED_REPEAT},ae={[ii]:i.NEAREST,[Ny]:i.NEAREST_MIPMAP_NEAREST,[Ql]:i.NEAREST_MIPMAP_LINEAR,[Wi]:i.LINEAR,[Ph]:i.LINEAR_MIPMAP_NEAREST,[ws]:i.LINEAR_MIPMAP_LINEAR},k={[ky]:i.NEVER,[Wy]:i.ALWAYS,[zy]:i.LESS,[Sv]:i.LEQUAL,[By]:i.EQUAL,[Gy]:i.GEQUAL,[Hy]:i.GREATER,[Vy]:i.NOTEQUAL};function ee(D,C){if(C.type===Xi&&e.has("OES_texture_float_linear")===!1&&(C.magFilter===Wi||C.magFilter===Ph||C.magFilter===Ql||C.magFilter===ws||C.minFilter===Wi||C.minFilter===Ph||C.minFilter===Ql||C.minFilter===ws)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(D,i.TEXTURE_WRAP_S,he[C.wrapS]),i.texParameteri(D,i.TEXTURE_WRAP_T,he[C.wrapT]),(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)&&i.texParameteri(D,i.TEXTURE_WRAP_R,he[C.wrapR]),i.texParameteri(D,i.TEXTURE_MAG_FILTER,ae[C.magFilter]),i.texParameteri(D,i.TEXTURE_MIN_FILTER,ae[C.minFilter]),C.compareFunction&&(i.texParameteri(D,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(D,i.TEXTURE_COMPARE_FUNC,k[C.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(C.magFilter===ii||C.minFilter!==Ql&&C.minFilter!==ws||C.type===Xi&&e.has("OES_texture_float_linear")===!1)return;if(C.anisotropy>1||r.get(C).__currentAnisotropy){const Z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(D,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(C.anisotropy,o.getMaxAnisotropy())),r.get(C).__currentAnisotropy=C.anisotropy}}}function Fe(D,C){let Z=!1;D.__webglInit===void 0&&(D.__webglInit=!0,C.addEventListener("dispose",I));const de=C.source;let xe=v.get(de);xe===void 0&&(xe={},v.set(de,xe));const pe=ie(C);if(pe!==D.__cacheKey){xe[pe]===void 0&&(xe[pe]={texture:i.createTexture(),usedTimes:0},c.memory.textures++,Z=!0),xe[pe].usedTimes++;const qe=xe[D.__cacheKey];qe!==void 0&&(xe[D.__cacheKey].usedTimes--,qe.usedTimes===0&&R(C)),D.__cacheKey=pe,D.__webglTexture=xe[pe].texture}return Z}function J(D,C,Z){let de=i.TEXTURE_2D;(C.isDataArrayTexture||C.isCompressedArrayTexture)&&(de=i.TEXTURE_2D_ARRAY),C.isData3DTexture&&(de=i.TEXTURE_3D);const xe=Fe(D,C),pe=C.source;t.bindTexture(de,D.__webglTexture,i.TEXTURE0+Z);const qe=r.get(pe);if(pe.version!==qe.__version||xe===!0){t.activeTexture(i.TEXTURE0+Z);const De=At.getPrimaries(At.workingColorSpace),Ge=C.colorSpace===jr?null:At.getPrimaries(C.colorSpace),pt=C.colorSpace===jr||De===Ge?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt);let Te=w(C.image,!1,o.maxTextureSize);Te=it(C,Te);const Xe=a.convert(C.format,C.colorSpace),ot=a.convert(C.type);let at=P(C.internalFormat,Xe,ot,C.colorSpace,C.isVideoTexture);ee(de,C);let je;const xt=C.mipmaps,ft=C.isVideoTexture!==!0,Lt=qe.__version===void 0||xe===!0,X=pe.dataReady,Ie=V(C,Te);if(C.isDepthTexture)at=T(C.format===Lo,C.type),Lt&&(ft?t.texStorage2D(i.TEXTURE_2D,1,at,Te.width,Te.height):t.texImage2D(i.TEXTURE_2D,0,at,Te.width,Te.height,0,Xe,ot,null));else if(C.isDataTexture)if(xt.length>0){ft&&Lt&&t.texStorage2D(i.TEXTURE_2D,Ie,at,xt[0].width,xt[0].height);for(let le=0,me=xt.length;le<me;le++)je=xt[le],ft?X&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,je.width,je.height,Xe,ot,je.data):t.texImage2D(i.TEXTURE_2D,le,at,je.width,je.height,0,Xe,ot,je.data);C.generateMipmaps=!1}else ft?(Lt&&t.texStorage2D(i.TEXTURE_2D,Ie,at,Te.width,Te.height),X&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Te.width,Te.height,Xe,ot,Te.data)):t.texImage2D(i.TEXTURE_2D,0,at,Te.width,Te.height,0,Xe,ot,Te.data);else if(C.isCompressedTexture)if(C.isCompressedArrayTexture){ft&&Lt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ie,at,xt[0].width,xt[0].height,Te.depth);for(let le=0,me=xt.length;le<me;le++)if(je=xt[le],C.format!==Li)if(Xe!==null)if(ft){if(X)if(C.layerUpdates.size>0){const ke=f0(je.width,je.height,C.format,C.type);for(const Ue of C.layerUpdates){const dt=je.data.subarray(Ue*ke/je.data.BYTES_PER_ELEMENT,(Ue+1)*ke/je.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,Ue,je.width,je.height,1,Xe,dt)}C.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,je.width,je.height,Te.depth,Xe,je.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,le,at,je.width,je.height,Te.depth,0,je.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ft?X&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,je.width,je.height,Te.depth,Xe,ot,je.data):t.texImage3D(i.TEXTURE_2D_ARRAY,le,at,je.width,je.height,Te.depth,0,Xe,ot,je.data)}else{ft&&Lt&&t.texStorage2D(i.TEXTURE_2D,Ie,at,xt[0].width,xt[0].height);for(let le=0,me=xt.length;le<me;le++)je=xt[le],C.format!==Li?Xe!==null?ft?X&&t.compressedTexSubImage2D(i.TEXTURE_2D,le,0,0,je.width,je.height,Xe,je.data):t.compressedTexImage2D(i.TEXTURE_2D,le,at,je.width,je.height,0,je.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ft?X&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,je.width,je.height,Xe,ot,je.data):t.texImage2D(i.TEXTURE_2D,le,at,je.width,je.height,0,Xe,ot,je.data)}else if(C.isDataArrayTexture)if(ft){if(Lt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ie,at,Te.width,Te.height,Te.depth),X)if(C.layerUpdates.size>0){const le=f0(Te.width,Te.height,C.format,C.type);for(const me of C.layerUpdates){const ke=Te.data.subarray(me*le/Te.data.BYTES_PER_ELEMENT,(me+1)*le/Te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,me,Te.width,Te.height,1,Xe,ot,ke)}C.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Te.width,Te.height,Te.depth,Xe,ot,Te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,at,Te.width,Te.height,Te.depth,0,Xe,ot,Te.data);else if(C.isData3DTexture)ft?(Lt&&t.texStorage3D(i.TEXTURE_3D,Ie,at,Te.width,Te.height,Te.depth),X&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Te.width,Te.height,Te.depth,Xe,ot,Te.data)):t.texImage3D(i.TEXTURE_3D,0,at,Te.width,Te.height,Te.depth,0,Xe,ot,Te.data);else if(C.isFramebufferTexture){if(Lt)if(ft)t.texStorage2D(i.TEXTURE_2D,Ie,at,Te.width,Te.height);else{let le=Te.width,me=Te.height;for(let ke=0;ke<Ie;ke++)t.texImage2D(i.TEXTURE_2D,ke,at,le,me,0,Xe,ot,null),le>>=1,me>>=1}}else if(xt.length>0){if(ft&&Lt){const le=Oe(xt[0]);t.texStorage2D(i.TEXTURE_2D,Ie,at,le.width,le.height)}for(let le=0,me=xt.length;le<me;le++)je=xt[le],ft?X&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,Xe,ot,je):t.texImage2D(i.TEXTURE_2D,le,at,Xe,ot,je);C.generateMipmaps=!1}else if(ft){if(Lt){const le=Oe(Te);t.texStorage2D(i.TEXTURE_2D,Ie,at,le.width,le.height)}X&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Xe,ot,Te)}else t.texImage2D(i.TEXTURE_2D,0,at,Xe,ot,Te);y(C)&&_(de),qe.__version=pe.version,C.onUpdate&&C.onUpdate(C)}D.__version=C.version}function fe(D,C,Z){if(C.image.length!==6)return;const de=Fe(D,C),xe=C.source;t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+Z);const pe=r.get(xe);if(xe.version!==pe.__version||de===!0){t.activeTexture(i.TEXTURE0+Z);const qe=At.getPrimaries(At.workingColorSpace),De=C.colorSpace===jr?null:At.getPrimaries(C.colorSpace),Ge=C.colorSpace===jr||qe===De?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge);const pt=C.isCompressedTexture||C.image[0].isCompressedTexture,Te=C.image[0]&&C.image[0].isDataTexture,Xe=[];for(let me=0;me<6;me++)!pt&&!Te?Xe[me]=w(C.image[me],!0,o.maxCubemapSize):Xe[me]=Te?C.image[me].image:C.image[me],Xe[me]=it(C,Xe[me]);const ot=Xe[0],at=a.convert(C.format,C.colorSpace),je=a.convert(C.type),xt=P(C.internalFormat,at,je,C.colorSpace),ft=C.isVideoTexture!==!0,Lt=pe.__version===void 0||de===!0,X=xe.dataReady;let Ie=V(C,ot);ee(i.TEXTURE_CUBE_MAP,C);let le;if(pt){ft&&Lt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ie,xt,ot.width,ot.height);for(let me=0;me<6;me++){le=Xe[me].mipmaps;for(let ke=0;ke<le.length;ke++){const Ue=le[ke];C.format!==Li?at!==null?ft?X&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,0,0,Ue.width,Ue.height,at,Ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,xt,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,0,0,Ue.width,Ue.height,at,je,Ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,xt,Ue.width,Ue.height,0,at,je,Ue.data)}}}else{if(le=C.mipmaps,ft&&Lt){le.length>0&&Ie++;const me=Oe(Xe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ie,xt,me.width,me.height)}for(let me=0;me<6;me++)if(Te){ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,Xe[me].width,Xe[me].height,at,je,Xe[me].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,xt,Xe[me].width,Xe[me].height,0,at,je,Xe[me].data);for(let ke=0;ke<le.length;ke++){const dt=le[ke].image[me].image;ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,0,0,dt.width,dt.height,at,je,dt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,xt,dt.width,dt.height,0,at,je,dt.data)}}else{ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,at,je,Xe[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,xt,at,je,Xe[me]);for(let ke=0;ke<le.length;ke++){const Ue=le[ke];ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,0,0,at,je,Ue.image[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,xt,at,je,Ue.image[me])}}}y(C)&&_(i.TEXTURE_CUBE_MAP),pe.__version=xe.version,C.onUpdate&&C.onUpdate(C)}D.__version=C.version}function we(D,C,Z,de,xe,pe){const qe=a.convert(Z.format,Z.colorSpace),De=a.convert(Z.type),Ge=P(Z.internalFormat,qe,De,Z.colorSpace),pt=r.get(C),Te=r.get(Z);if(Te.__renderTarget=C,!pt.__hasExternalTextures){const Xe=Math.max(1,C.width>>pe),ot=Math.max(1,C.height>>pe);xe===i.TEXTURE_3D||xe===i.TEXTURE_2D_ARRAY?t.texImage3D(xe,pe,Ge,Xe,ot,C.depth,0,qe,De,null):t.texImage2D(xe,pe,Ge,Xe,ot,0,qe,De,null)}t.bindFramebuffer(i.FRAMEBUFFER,D),Ve(C)?u.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,de,xe,Te.__webglTexture,0,Ee(C)):(xe===i.TEXTURE_2D||xe>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&xe<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,de,xe,Te.__webglTexture,pe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ve(D,C,Z){if(i.bindRenderbuffer(i.RENDERBUFFER,D),C.depthBuffer){const de=C.depthTexture,xe=de&&de.isDepthTexture?de.type:null,pe=T(C.stencilBuffer,xe),qe=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,De=Ee(C);Ve(C)?u.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,De,pe,C.width,C.height):Z?i.renderbufferStorageMultisample(i.RENDERBUFFER,De,pe,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,pe,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,qe,i.RENDERBUFFER,D)}else{const de=C.textures;for(let xe=0;xe<de.length;xe++){const pe=de[xe],qe=a.convert(pe.format,pe.colorSpace),De=a.convert(pe.type),Ge=P(pe.internalFormat,qe,De,pe.colorSpace),pt=Ee(C);Z&&Ve(C)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,pt,Ge,C.width,C.height):Ve(C)?u.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,pt,Ge,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,Ge,C.width,C.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ae(D,C){if(C&&C.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,D),!(C.depthTexture&&C.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const de=r.get(C.depthTexture);de.__renderTarget=C,(!de.__webglTexture||C.depthTexture.image.width!==C.width||C.depthTexture.image.height!==C.height)&&(C.depthTexture.image.width=C.width,C.depthTexture.image.height=C.height,C.depthTexture.needsUpdate=!0),ce(C.depthTexture,0);const xe=de.__webglTexture,pe=Ee(C);if(C.depthTexture.format===wo)Ve(C)?u.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,xe,0,pe):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,xe,0);else if(C.depthTexture.format===Lo)Ve(C)?u.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,xe,0,pe):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,xe,0);else throw new Error("Unknown depthTexture format")}function Be(D){const C=r.get(D),Z=D.isWebGLCubeRenderTarget===!0;if(C.__boundDepthTexture!==D.depthTexture){const de=D.depthTexture;if(C.__depthDisposeCallback&&C.__depthDisposeCallback(),de){const xe=()=>{delete C.__boundDepthTexture,delete C.__depthDisposeCallback,de.removeEventListener("dispose",xe)};de.addEventListener("dispose",xe),C.__depthDisposeCallback=xe}C.__boundDepthTexture=de}if(D.depthTexture&&!C.__autoAllocateDepthBuffer){if(Z)throw new Error("target.depthTexture not supported in Cube render targets");Ae(C.__webglFramebuffer,D)}else if(Z){C.__webglDepthbuffer=[];for(let de=0;de<6;de++)if(t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer[de]),C.__webglDepthbuffer[de]===void 0)C.__webglDepthbuffer[de]=i.createRenderbuffer(),ve(C.__webglDepthbuffer[de],D,!1);else{const xe=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pe=C.__webglDepthbuffer[de];i.bindRenderbuffer(i.RENDERBUFFER,pe),i.framebufferRenderbuffer(i.FRAMEBUFFER,xe,i.RENDERBUFFER,pe)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer),C.__webglDepthbuffer===void 0)C.__webglDepthbuffer=i.createRenderbuffer(),ve(C.__webglDepthbuffer,D,!1);else{const de=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=C.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,xe),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,xe)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ze(D,C,Z){const de=r.get(D);C!==void 0&&we(de.__webglFramebuffer,D,D.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),Z!==void 0&&Be(D)}function _t(D){const C=D.texture,Z=r.get(D),de=r.get(C);D.addEventListener("dispose",N);const xe=D.textures,pe=D.isWebGLCubeRenderTarget===!0,qe=xe.length>1;if(qe||(de.__webglTexture===void 0&&(de.__webglTexture=i.createTexture()),de.__version=C.version,c.memory.textures++),pe){Z.__webglFramebuffer=[];for(let De=0;De<6;De++)if(C.mipmaps&&C.mipmaps.length>0){Z.__webglFramebuffer[De]=[];for(let Ge=0;Ge<C.mipmaps.length;Ge++)Z.__webglFramebuffer[De][Ge]=i.createFramebuffer()}else Z.__webglFramebuffer[De]=i.createFramebuffer()}else{if(C.mipmaps&&C.mipmaps.length>0){Z.__webglFramebuffer=[];for(let De=0;De<C.mipmaps.length;De++)Z.__webglFramebuffer[De]=i.createFramebuffer()}else Z.__webglFramebuffer=i.createFramebuffer();if(qe)for(let De=0,Ge=xe.length;De<Ge;De++){const pt=r.get(xe[De]);pt.__webglTexture===void 0&&(pt.__webglTexture=i.createTexture(),c.memory.textures++)}if(D.samples>0&&Ve(D)===!1){Z.__webglMultisampledFramebuffer=i.createFramebuffer(),Z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let De=0;De<xe.length;De++){const Ge=xe[De];Z.__webglColorRenderbuffer[De]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,Z.__webglColorRenderbuffer[De]);const pt=a.convert(Ge.format,Ge.colorSpace),Te=a.convert(Ge.type),Xe=P(Ge.internalFormat,pt,Te,Ge.colorSpace,D.isXRRenderTarget===!0),ot=Ee(D);i.renderbufferStorageMultisample(i.RENDERBUFFER,ot,Xe,D.width,D.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.RENDERBUFFER,Z.__webglColorRenderbuffer[De])}i.bindRenderbuffer(i.RENDERBUFFER,null),D.depthBuffer&&(Z.__webglDepthRenderbuffer=i.createRenderbuffer(),ve(Z.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(pe){t.bindTexture(i.TEXTURE_CUBE_MAP,de.__webglTexture),ee(i.TEXTURE_CUBE_MAP,C);for(let De=0;De<6;De++)if(C.mipmaps&&C.mipmaps.length>0)for(let Ge=0;Ge<C.mipmaps.length;Ge++)we(Z.__webglFramebuffer[De][Ge],D,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ge);else we(Z.__webglFramebuffer[De],D,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+De,0);y(C)&&_(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(qe){for(let De=0,Ge=xe.length;De<Ge;De++){const pt=xe[De],Te=r.get(pt);t.bindTexture(i.TEXTURE_2D,Te.__webglTexture),ee(i.TEXTURE_2D,pt),we(Z.__webglFramebuffer,D,pt,i.COLOR_ATTACHMENT0+De,i.TEXTURE_2D,0),y(pt)&&_(i.TEXTURE_2D)}t.unbindTexture()}else{let De=i.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(De=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(De,de.__webglTexture),ee(De,C),C.mipmaps&&C.mipmaps.length>0)for(let Ge=0;Ge<C.mipmaps.length;Ge++)we(Z.__webglFramebuffer[Ge],D,C,i.COLOR_ATTACHMENT0,De,Ge);else we(Z.__webglFramebuffer,D,C,i.COLOR_ATTACHMENT0,De,0);y(C)&&_(De),t.unbindTexture()}D.depthBuffer&&Be(D)}function _e(D){const C=D.textures;for(let Z=0,de=C.length;Z<de;Z++){const xe=C[Z];if(y(xe)){const pe=L(D),qe=r.get(xe).__webglTexture;t.bindTexture(pe,qe),_(pe),t.unbindTexture()}}}const Re=[],O=[];function Qe(D){if(D.samples>0){if(Ve(D)===!1){const C=D.textures,Z=D.width,de=D.height;let xe=i.COLOR_BUFFER_BIT;const pe=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,qe=r.get(D),De=C.length>1;if(De)for(let Ge=0;Ge<C.length;Ge++)t.bindFramebuffer(i.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,qe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,qe.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,qe.__webglFramebuffer);for(let Ge=0;Ge<C.length;Ge++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(xe|=i.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(xe|=i.STENCIL_BUFFER_BIT)),De){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,qe.__webglColorRenderbuffer[Ge]);const pt=r.get(C[Ge]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,pt,0)}i.blitFramebuffer(0,0,Z,de,0,0,Z,de,xe,i.NEAREST),f===!0&&(Re.length=0,O.length=0,Re.push(i.COLOR_ATTACHMENT0+Ge),D.depthBuffer&&D.resolveDepthBuffer===!1&&(Re.push(pe),O.push(pe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,O)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Re))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),De)for(let Ge=0;Ge<C.length;Ge++){t.bindFramebuffer(i.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.RENDERBUFFER,qe.__webglColorRenderbuffer[Ge]);const pt=r.get(C[Ge]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,qe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.TEXTURE_2D,pt,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,qe.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&f){const C=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[C])}}}function Ee(D){return Math.min(o.maxSamples,D.samples)}function Ve(D){const C=r.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&C.__useRenderToTexture!==!1}function Le(D){const C=c.render.frame;m.get(D)!==C&&(m.set(D,C),D.update())}function it(D,C){const Z=D.colorSpace,de=D.format,xe=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||Z!==Uo&&Z!==jr&&(At.getTransfer(Z)===Nt?(de!==Li||xe!==gr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Z)),C}function Oe(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(d.width=D.naturalWidth||D.width,d.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(d.width=D.displayWidth,d.height=D.displayHeight):(d.width=D.width,d.height=D.height),d}this.allocateTextureUnit=Y,this.resetTextureUnits=$,this.setTexture2D=ce,this.setTexture2DArray=oe,this.setTexture3D=ue,this.setTextureCube=G,this.rebindTextures=Ze,this.setupRenderTarget=_t,this.updateRenderTargetMipmap=_e,this.updateMultisampleRenderTarget=Qe,this.setupDepthRenderbuffer=Be,this.setupFrameBufferTexture=we,this.useMultisampledRTT=Ve}function cT(i,e){function t(r,o=jr){let a;const c=At.getTransfer(o);if(r===gr)return i.UNSIGNED_BYTE;if(r===Sd)return i.UNSIGNED_SHORT_4_4_4_4;if(r===Md)return i.UNSIGNED_SHORT_5_5_5_1;if(r===dv)return i.UNSIGNED_INT_5_9_9_9_REV;if(r===hv)return i.BYTE;if(r===fv)return i.SHORT;if(r===ka)return i.UNSIGNED_SHORT;if(r===yd)return i.INT;if(r===Es)return i.UNSIGNED_INT;if(r===Xi)return i.FLOAT;if(r===Wa)return i.HALF_FLOAT;if(r===pv)return i.ALPHA;if(r===mv)return i.RGB;if(r===Li)return i.RGBA;if(r===gv)return i.LUMINANCE;if(r===vv)return i.LUMINANCE_ALPHA;if(r===wo)return i.DEPTH_COMPONENT;if(r===Lo)return i.DEPTH_STENCIL;if(r===wd)return i.RED;if(r===Ed)return i.RED_INTEGER;if(r===_v)return i.RG;if(r===Td)return i.RG_INTEGER;if(r===Ad)return i.RGBA_INTEGER;if(r===Lc||r===Dc||r===Ic||r===Nc)if(c===Nt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===Lc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Dc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Ic)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Nc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===Lc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Dc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Ic)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Nc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Uf||r===Ff||r===Of||r===kf)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===Uf)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Ff)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===Of)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===kf)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===zf||r===Bf||r===Hf)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(r===zf||r===Bf)return c===Nt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===Hf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===Vf||r===Gf||r===Wf||r===Xf||r===jf||r===Yf||r===qf||r===Kf||r===$f||r===Zf||r===Qf||r===Jf||r===ed||r===td)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(r===Vf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Gf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Wf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Xf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===jf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Yf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===qf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Kf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===$f)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Zf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Qf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Jf)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===ed)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===td)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Uc||r===nd||r===id)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(r===Uc)return c===Nt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===nd)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===id)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===xv||r===rd||r===sd||r===od)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(r===Uc)return a.COMPRESSED_RED_RGTC1_EXT;if(r===rd)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===sd)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===od)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===bo?i.UNSIGNED_INT_24_8:i[r]!==void 0?i[r]:null}return{convert:t}}class uT extends mi{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Zt extends fn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const hT={type:"move"};class nf{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Zt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Zt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Zt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let o=null,a=null,c=null;const u=this._targetRay,f=this._grip,d=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(d&&e.hand){c=!0;for(const w of e.hand.values()){const y=t.getJointPose(w,r),_=this._getHandJoint(d,w);y!==null&&(_.matrix.fromArray(y.transform.matrix),_.matrix.decompose(_.position,_.rotation,_.scale),_.matrixWorldNeedsUpdate=!0,_.jointRadius=y.radius),_.visible=y!==null}const m=d.joints["index-finger-tip"],g=d.joints["thumb-tip"],v=m.position.distanceTo(g.position),S=.02,M=.005;d.inputState.pinching&&v>S+M?(d.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!d.inputState.pinching&&v<=S-M&&(d.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else f!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,r),a!==null&&(f.matrix.fromArray(a.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,a.linearVelocity?(f.hasLinearVelocity=!0,f.linearVelocity.copy(a.linearVelocity)):f.hasLinearVelocity=!1,a.angularVelocity?(f.hasAngularVelocity=!0,f.angularVelocity.copy(a.angularVelocity)):f.hasAngularVelocity=!1));u!==null&&(o=t.getPose(e.targetRaySpace,r),o===null&&a!==null&&(o=a),o!==null&&(u.matrix.fromArray(o.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,o.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(o.linearVelocity)):u.hasLinearVelocity=!1,o.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(o.angularVelocity)):u.hasAngularVelocity=!1,this.dispatchEvent(hT)))}return u!==null&&(u.visible=o!==null),f!==null&&(f.visible=a!==null),d!==null&&(d.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new Zt;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}const fT=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,dT=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class pT{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,r){if(this.texture===null){const o=new Rn,a=e.properties.get(o);a.__webglTexture=t.texture,(t.depthNear!=r.depthNear||t.depthFar!=r.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=o}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,r=new vr({vertexShader:fT,fragmentShader:dT,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Pt(new zo(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class mT extends Fo{constructor(e,t){super();const r=this;let o=null,a=1,c=null,u="local-floor",f=1,d=null,m=null,g=null,v=null,S=null,M=null;const w=new pT,y=t.getContextAttributes();let _=null,L=null;const P=[],T=[],V=new ze;let I=null;const N=new mi;N.viewport=new jt;const z=new mi;z.viewport=new jt;const R=[N,z],A=new uT;let F=null,$=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let fe=P[J];return fe===void 0&&(fe=new nf,P[J]=fe),fe.getTargetRaySpace()},this.getControllerGrip=function(J){let fe=P[J];return fe===void 0&&(fe=new nf,P[J]=fe),fe.getGripSpace()},this.getHand=function(J){let fe=P[J];return fe===void 0&&(fe=new nf,P[J]=fe),fe.getHandSpace()};function Y(J){const fe=T.indexOf(J.inputSource);if(fe===-1)return;const we=P[fe];we!==void 0&&(we.update(J.inputSource,J.frame,d||c),we.dispatchEvent({type:J.type,data:J.inputSource}))}function ie(){o.removeEventListener("select",Y),o.removeEventListener("selectstart",Y),o.removeEventListener("selectend",Y),o.removeEventListener("squeeze",Y),o.removeEventListener("squeezestart",Y),o.removeEventListener("squeezeend",Y),o.removeEventListener("end",ie),o.removeEventListener("inputsourceschange",ce);for(let J=0;J<P.length;J++){const fe=T[J];fe!==null&&(T[J]=null,P[J].disconnect(fe))}F=null,$=null,w.reset(),e.setRenderTarget(_),S=null,v=null,g=null,o=null,L=null,Fe.stop(),r.isPresenting=!1,e.setPixelRatio(I),e.setSize(V.width,V.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){a=J,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){u=J,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return d||c},this.setReferenceSpace=function(J){d=J},this.getBaseLayer=function(){return v!==null?v:S},this.getBinding=function(){return g},this.getFrame=function(){return M},this.getSession=function(){return o},this.setSession=async function(J){if(o=J,o!==null){if(_=e.getRenderTarget(),o.addEventListener("select",Y),o.addEventListener("selectstart",Y),o.addEventListener("selectend",Y),o.addEventListener("squeeze",Y),o.addEventListener("squeezestart",Y),o.addEventListener("squeezeend",Y),o.addEventListener("end",ie),o.addEventListener("inputsourceschange",ce),y.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(V),o.renderState.layers===void 0){const fe={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:a};S=new XRWebGLLayer(o,t,fe),o.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),L=new Ts(S.framebufferWidth,S.framebufferHeight,{format:Li,type:gr,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil})}else{let fe=null,we=null,ve=null;y.depth&&(ve=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=y.stencil?Lo:wo,we=y.stencil?bo:Es);const Ae={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:a};g=new XRWebGLBinding(o,t),v=g.createProjectionLayer(Ae),o.updateRenderState({layers:[v]}),e.setPixelRatio(1),e.setSize(v.textureWidth,v.textureHeight,!1),L=new Ts(v.textureWidth,v.textureHeight,{format:Li,type:gr,depthTexture:new Uv(v.textureWidth,v.textureHeight,we,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:v.ignoreDepthValues===!1})}L.isXRRenderTarget=!0,this.setFoveation(f),d=null,c=await o.requestReferenceSpace(u),Fe.setContext(o),Fe.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return w.getDepthTexture()};function ce(J){for(let fe=0;fe<J.removed.length;fe++){const we=J.removed[fe],ve=T.indexOf(we);ve>=0&&(T[ve]=null,P[ve].disconnect(we))}for(let fe=0;fe<J.added.length;fe++){const we=J.added[fe];let ve=T.indexOf(we);if(ve===-1){for(let Be=0;Be<P.length;Be++)if(Be>=T.length){T.push(we),ve=Be;break}else if(T[Be]===null){T[Be]=we,ve=Be;break}if(ve===-1)break}const Ae=P[ve];Ae&&Ae.connect(we)}}const oe=new B,ue=new B;function G(J,fe,we){oe.setFromMatrixPosition(fe.matrixWorld),ue.setFromMatrixPosition(we.matrixWorld);const ve=oe.distanceTo(ue),Ae=fe.projectionMatrix.elements,Be=we.projectionMatrix.elements,Ze=Ae[14]/(Ae[10]-1),_t=Ae[14]/(Ae[10]+1),_e=(Ae[9]+1)/Ae[5],Re=(Ae[9]-1)/Ae[5],O=(Ae[8]-1)/Ae[0],Qe=(Be[8]+1)/Be[0],Ee=Ze*O,Ve=Ze*Qe,Le=ve/(-O+Qe),it=Le*-O;if(fe.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(it),J.translateZ(Le),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Ae[10]===-1)J.projectionMatrix.copy(fe.projectionMatrix),J.projectionMatrixInverse.copy(fe.projectionMatrixInverse);else{const Oe=Ze+Le,D=_t+Le,C=Ee-it,Z=Ve+(ve-it),de=_e*_t/D*Oe,xe=Re*_t/D*Oe;J.projectionMatrix.makePerspective(C,Z,de,xe,Oe,D),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function he(J,fe){fe===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(fe.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(o===null)return;let fe=J.near,we=J.far;w.texture!==null&&(w.depthNear>0&&(fe=w.depthNear),w.depthFar>0&&(we=w.depthFar)),A.near=z.near=N.near=fe,A.far=z.far=N.far=we,(F!==A.near||$!==A.far)&&(o.updateRenderState({depthNear:A.near,depthFar:A.far}),F=A.near,$=A.far),N.layers.mask=J.layers.mask|2,z.layers.mask=J.layers.mask|4,A.layers.mask=N.layers.mask|z.layers.mask;const ve=J.parent,Ae=A.cameras;he(A,ve);for(let Be=0;Be<Ae.length;Be++)he(Ae[Be],ve);Ae.length===2?G(A,N,z):A.projectionMatrix.copy(N.projectionMatrix),ae(J,A,ve)};function ae(J,fe,we){we===null?J.matrix.copy(fe.matrixWorld):(J.matrix.copy(we.matrixWorld),J.matrix.invert(),J.matrix.multiply(fe.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(fe.projectionMatrix),J.projectionMatrixInverse.copy(fe.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=za*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(!(v===null&&S===null))return f},this.setFoveation=function(J){f=J,v!==null&&(v.fixedFoveation=J),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=J)},this.hasDepthSensing=function(){return w.texture!==null},this.getDepthSensingMesh=function(){return w.getMesh(A)};let k=null;function ee(J,fe){if(m=fe.getViewerPose(d||c),M=fe,m!==null){const we=m.views;S!==null&&(e.setRenderTargetFramebuffer(L,S.framebuffer),e.setRenderTarget(L));let ve=!1;we.length!==A.cameras.length&&(A.cameras.length=0,ve=!0);for(let Be=0;Be<we.length;Be++){const Ze=we[Be];let _t=null;if(S!==null)_t=S.getViewport(Ze);else{const Re=g.getViewSubImage(v,Ze);_t=Re.viewport,Be===0&&(e.setRenderTargetTextures(L,Re.colorTexture,v.ignoreDepthValues?void 0:Re.depthStencilTexture),e.setRenderTarget(L))}let _e=R[Be];_e===void 0&&(_e=new mi,_e.layers.enable(Be),_e.viewport=new jt,R[Be]=_e),_e.matrix.fromArray(Ze.transform.matrix),_e.matrix.decompose(_e.position,_e.quaternion,_e.scale),_e.projectionMatrix.fromArray(Ze.projectionMatrix),_e.projectionMatrixInverse.copy(_e.projectionMatrix).invert(),_e.viewport.set(_t.x,_t.y,_t.width,_t.height),Be===0&&(A.matrix.copy(_e.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),ve===!0&&A.cameras.push(_e)}const Ae=o.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")){const Be=g.getDepthInformation(we[0]);Be&&Be.isValid&&Be.texture&&w.init(e,Be,o.renderState)}}for(let we=0;we<P.length;we++){const ve=T[we],Ae=P[we];ve!==null&&Ae!==void 0&&Ae.update(ve,fe,d||c)}k&&k(J,fe),fe.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:fe}),M=null}const Fe=new Iv;Fe.setAnimationLoop(ee),this.setAnimationLoop=function(J){k=J},this.dispose=function(){}}}const gs=new vi,gT=new It;function vT(i,e){function t(y,_){y.matrixAutoUpdate===!0&&y.updateMatrix(),_.value.copy(y.matrix)}function r(y,_){_.color.getRGB(y.fogColor.value,bv(i)),_.isFog?(y.fogNear.value=_.near,y.fogFar.value=_.far):_.isFogExp2&&(y.fogDensity.value=_.density)}function o(y,_,L,P,T){_.isMeshBasicMaterial||_.isMeshLambertMaterial?a(y,_):_.isMeshToonMaterial?(a(y,_),g(y,_)):_.isMeshPhongMaterial?(a(y,_),m(y,_)):_.isMeshStandardMaterial?(a(y,_),v(y,_),_.isMeshPhysicalMaterial&&S(y,_,T)):_.isMeshMatcapMaterial?(a(y,_),M(y,_)):_.isMeshDepthMaterial?a(y,_):_.isMeshDistanceMaterial?(a(y,_),w(y,_)):_.isMeshNormalMaterial?a(y,_):_.isLineBasicMaterial?(c(y,_),_.isLineDashedMaterial&&u(y,_)):_.isPointsMaterial?f(y,_,L,P):_.isSpriteMaterial?d(y,_):_.isShadowMaterial?(y.color.value.copy(_.color),y.opacity.value=_.opacity):_.isShaderMaterial&&(_.uniformsNeedUpdate=!1)}function a(y,_){y.opacity.value=_.opacity,_.color&&y.diffuse.value.copy(_.color),_.emissive&&y.emissive.value.copy(_.emissive).multiplyScalar(_.emissiveIntensity),_.map&&(y.map.value=_.map,t(_.map,y.mapTransform)),_.alphaMap&&(y.alphaMap.value=_.alphaMap,t(_.alphaMap,y.alphaMapTransform)),_.bumpMap&&(y.bumpMap.value=_.bumpMap,t(_.bumpMap,y.bumpMapTransform),y.bumpScale.value=_.bumpScale,_.side===On&&(y.bumpScale.value*=-1)),_.normalMap&&(y.normalMap.value=_.normalMap,t(_.normalMap,y.normalMapTransform),y.normalScale.value.copy(_.normalScale),_.side===On&&y.normalScale.value.negate()),_.displacementMap&&(y.displacementMap.value=_.displacementMap,t(_.displacementMap,y.displacementMapTransform),y.displacementScale.value=_.displacementScale,y.displacementBias.value=_.displacementBias),_.emissiveMap&&(y.emissiveMap.value=_.emissiveMap,t(_.emissiveMap,y.emissiveMapTransform)),_.specularMap&&(y.specularMap.value=_.specularMap,t(_.specularMap,y.specularMapTransform)),_.alphaTest>0&&(y.alphaTest.value=_.alphaTest);const L=e.get(_),P=L.envMap,T=L.envMapRotation;P&&(y.envMap.value=P,gs.copy(T),gs.x*=-1,gs.y*=-1,gs.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(gs.y*=-1,gs.z*=-1),y.envMapRotation.value.setFromMatrix4(gT.makeRotationFromEuler(gs)),y.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,y.reflectivity.value=_.reflectivity,y.ior.value=_.ior,y.refractionRatio.value=_.refractionRatio),_.lightMap&&(y.lightMap.value=_.lightMap,y.lightMapIntensity.value=_.lightMapIntensity,t(_.lightMap,y.lightMapTransform)),_.aoMap&&(y.aoMap.value=_.aoMap,y.aoMapIntensity.value=_.aoMapIntensity,t(_.aoMap,y.aoMapTransform))}function c(y,_){y.diffuse.value.copy(_.color),y.opacity.value=_.opacity,_.map&&(y.map.value=_.map,t(_.map,y.mapTransform))}function u(y,_){y.dashSize.value=_.dashSize,y.totalSize.value=_.dashSize+_.gapSize,y.scale.value=_.scale}function f(y,_,L,P){y.diffuse.value.copy(_.color),y.opacity.value=_.opacity,y.size.value=_.size*L,y.scale.value=P*.5,_.map&&(y.map.value=_.map,t(_.map,y.uvTransform)),_.alphaMap&&(y.alphaMap.value=_.alphaMap,t(_.alphaMap,y.alphaMapTransform)),_.alphaTest>0&&(y.alphaTest.value=_.alphaTest)}function d(y,_){y.diffuse.value.copy(_.color),y.opacity.value=_.opacity,y.rotation.value=_.rotation,_.map&&(y.map.value=_.map,t(_.map,y.mapTransform)),_.alphaMap&&(y.alphaMap.value=_.alphaMap,t(_.alphaMap,y.alphaMapTransform)),_.alphaTest>0&&(y.alphaTest.value=_.alphaTest)}function m(y,_){y.specular.value.copy(_.specular),y.shininess.value=Math.max(_.shininess,1e-4)}function g(y,_){_.gradientMap&&(y.gradientMap.value=_.gradientMap)}function v(y,_){y.metalness.value=_.metalness,_.metalnessMap&&(y.metalnessMap.value=_.metalnessMap,t(_.metalnessMap,y.metalnessMapTransform)),y.roughness.value=_.roughness,_.roughnessMap&&(y.roughnessMap.value=_.roughnessMap,t(_.roughnessMap,y.roughnessMapTransform)),_.envMap&&(y.envMapIntensity.value=_.envMapIntensity)}function S(y,_,L){y.ior.value=_.ior,_.sheen>0&&(y.sheenColor.value.copy(_.sheenColor).multiplyScalar(_.sheen),y.sheenRoughness.value=_.sheenRoughness,_.sheenColorMap&&(y.sheenColorMap.value=_.sheenColorMap,t(_.sheenColorMap,y.sheenColorMapTransform)),_.sheenRoughnessMap&&(y.sheenRoughnessMap.value=_.sheenRoughnessMap,t(_.sheenRoughnessMap,y.sheenRoughnessMapTransform))),_.clearcoat>0&&(y.clearcoat.value=_.clearcoat,y.clearcoatRoughness.value=_.clearcoatRoughness,_.clearcoatMap&&(y.clearcoatMap.value=_.clearcoatMap,t(_.clearcoatMap,y.clearcoatMapTransform)),_.clearcoatRoughnessMap&&(y.clearcoatRoughnessMap.value=_.clearcoatRoughnessMap,t(_.clearcoatRoughnessMap,y.clearcoatRoughnessMapTransform)),_.clearcoatNormalMap&&(y.clearcoatNormalMap.value=_.clearcoatNormalMap,t(_.clearcoatNormalMap,y.clearcoatNormalMapTransform),y.clearcoatNormalScale.value.copy(_.clearcoatNormalScale),_.side===On&&y.clearcoatNormalScale.value.negate())),_.dispersion>0&&(y.dispersion.value=_.dispersion),_.iridescence>0&&(y.iridescence.value=_.iridescence,y.iridescenceIOR.value=_.iridescenceIOR,y.iridescenceThicknessMinimum.value=_.iridescenceThicknessRange[0],y.iridescenceThicknessMaximum.value=_.iridescenceThicknessRange[1],_.iridescenceMap&&(y.iridescenceMap.value=_.iridescenceMap,t(_.iridescenceMap,y.iridescenceMapTransform)),_.iridescenceThicknessMap&&(y.iridescenceThicknessMap.value=_.iridescenceThicknessMap,t(_.iridescenceThicknessMap,y.iridescenceThicknessMapTransform))),_.transmission>0&&(y.transmission.value=_.transmission,y.transmissionSamplerMap.value=L.texture,y.transmissionSamplerSize.value.set(L.width,L.height),_.transmissionMap&&(y.transmissionMap.value=_.transmissionMap,t(_.transmissionMap,y.transmissionMapTransform)),y.thickness.value=_.thickness,_.thicknessMap&&(y.thicknessMap.value=_.thicknessMap,t(_.thicknessMap,y.thicknessMapTransform)),y.attenuationDistance.value=_.attenuationDistance,y.attenuationColor.value.copy(_.attenuationColor)),_.anisotropy>0&&(y.anisotropyVector.value.set(_.anisotropy*Math.cos(_.anisotropyRotation),_.anisotropy*Math.sin(_.anisotropyRotation)),_.anisotropyMap&&(y.anisotropyMap.value=_.anisotropyMap,t(_.anisotropyMap,y.anisotropyMapTransform))),y.specularIntensity.value=_.specularIntensity,y.specularColor.value.copy(_.specularColor),_.specularColorMap&&(y.specularColorMap.value=_.specularColorMap,t(_.specularColorMap,y.specularColorMapTransform)),_.specularIntensityMap&&(y.specularIntensityMap.value=_.specularIntensityMap,t(_.specularIntensityMap,y.specularIntensityMapTransform))}function M(y,_){_.matcap&&(y.matcap.value=_.matcap)}function w(y,_){const L=e.get(_).light;y.referencePosition.value.setFromMatrixPosition(L.matrixWorld),y.nearDistance.value=L.shadow.camera.near,y.farDistance.value=L.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:o}}function _T(i,e,t,r){let o={},a={},c=[];const u=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function f(L,P){const T=P.program;r.uniformBlockBinding(L,T)}function d(L,P){let T=o[L.id];T===void 0&&(M(L),T=m(L),o[L.id]=T,L.addEventListener("dispose",y));const V=P.program;r.updateUBOMapping(L,V);const I=e.render.frame;a[L.id]!==I&&(v(L),a[L.id]=I)}function m(L){const P=g();L.__bindingPointIndex=P;const T=i.createBuffer(),V=L.__size,I=L.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,V,I),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,P,T),T}function g(){for(let L=0;L<u;L++)if(c.indexOf(L)===-1)return c.push(L),L;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function v(L){const P=o[L.id],T=L.uniforms,V=L.__cache;i.bindBuffer(i.UNIFORM_BUFFER,P);for(let I=0,N=T.length;I<N;I++){const z=Array.isArray(T[I])?T[I]:[T[I]];for(let R=0,A=z.length;R<A;R++){const F=z[R];if(S(F,I,R,V)===!0){const $=F.__offset,Y=Array.isArray(F.value)?F.value:[F.value];let ie=0;for(let ce=0;ce<Y.length;ce++){const oe=Y[ce],ue=w(oe);typeof oe=="number"||typeof oe=="boolean"?(F.__data[0]=oe,i.bufferSubData(i.UNIFORM_BUFFER,$+ie,F.__data)):oe.isMatrix3?(F.__data[0]=oe.elements[0],F.__data[1]=oe.elements[1],F.__data[2]=oe.elements[2],F.__data[3]=0,F.__data[4]=oe.elements[3],F.__data[5]=oe.elements[4],F.__data[6]=oe.elements[5],F.__data[7]=0,F.__data[8]=oe.elements[6],F.__data[9]=oe.elements[7],F.__data[10]=oe.elements[8],F.__data[11]=0):(oe.toArray(F.__data,ie),ie+=ue.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,$,F.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function S(L,P,T,V){const I=L.value,N=P+"_"+T;if(V[N]===void 0)return typeof I=="number"||typeof I=="boolean"?V[N]=I:V[N]=I.clone(),!0;{const z=V[N];if(typeof I=="number"||typeof I=="boolean"){if(z!==I)return V[N]=I,!0}else if(z.equals(I)===!1)return z.copy(I),!0}return!1}function M(L){const P=L.uniforms;let T=0;const V=16;for(let N=0,z=P.length;N<z;N++){const R=Array.isArray(P[N])?P[N]:[P[N]];for(let A=0,F=R.length;A<F;A++){const $=R[A],Y=Array.isArray($.value)?$.value:[$.value];for(let ie=0,ce=Y.length;ie<ce;ie++){const oe=Y[ie],ue=w(oe),G=T%V,he=G%ue.boundary,ae=G+he;T+=he,ae!==0&&V-ae<ue.storage&&(T+=V-ae),$.__data=new Float32Array(ue.storage/Float32Array.BYTES_PER_ELEMENT),$.__offset=T,T+=ue.storage}}}const I=T%V;return I>0&&(T+=V-I),L.__size=T,L.__cache={},this}function w(L){const P={boundary:0,storage:0};return typeof L=="number"||typeof L=="boolean"?(P.boundary=4,P.storage=4):L.isVector2?(P.boundary=8,P.storage=8):L.isVector3||L.isColor?(P.boundary=16,P.storage=12):L.isVector4?(P.boundary=16,P.storage=16):L.isMatrix3?(P.boundary=48,P.storage=48):L.isMatrix4?(P.boundary=64,P.storage=64):L.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",L),P}function y(L){const P=L.target;P.removeEventListener("dispose",y);const T=c.indexOf(P.__bindingPointIndex);c.splice(T,1),i.deleteBuffer(o[P.id]),delete o[P.id],delete a[P.id]}function _(){for(const L in o)i.deleteBuffer(o[L]);c=[],o={},a={}}return{bind:f,update:d,dispose:_}}class xT{constructor(e={}){const{canvas:t=aS(),context:r=null,depth:o=!0,stencil:a=!1,alpha:c=!1,antialias:u=!1,premultipliedAlpha:f=!0,preserveDrawingBuffer:d=!1,powerPreference:m="default",failIfMajorPerformanceCaveat:g=!1,reverseDepthBuffer:v=!1}=e;this.isWebGLRenderer=!0;let S;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=r.getContextAttributes().alpha}else S=c;const M=new Uint32Array(4),w=new Int32Array(4);let y=null,_=null;const L=[],P=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=gn,this.toneMapping=Kr,this.toneMappingExposure=1;const T=this;let V=!1,I=0,N=0,z=null,R=-1,A=null;const F=new jt,$=new jt;let Y=null;const ie=new ht(0);let ce=0,oe=t.width,ue=t.height,G=1,he=null,ae=null;const k=new jt(0,0,oe,ue),ee=new jt(0,0,oe,ue);let Fe=!1;const J=new Rd;let fe=!1,we=!1;const ve=new It,Ae=new It,Be=new B,Ze=new jt,_t={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let _e=!1;function Re(){return z===null?G:1}let O=r;function Qe(b,j){return t.getContext(b,j)}try{const b={alpha:!0,depth:o,stencil:a,antialias:u,premultipliedAlpha:f,preserveDrawingBuffer:d,powerPreference:m,failIfMajorPerformanceCaveat:g};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${xd}`),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",ke,!1),t.addEventListener("webglcontextcreationerror",Ue,!1),O===null){const j="webgl2";if(O=Qe(j,b),O===null)throw Qe(j)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Ee,Ve,Le,it,Oe,D,C,Z,de,xe,pe,qe,De,Ge,pt,Te,Xe,ot,at,je,xt,ft,Lt,X;function Ie(){Ee=new Ew(O),Ee.init(),ft=new cT(O,Ee),Ve=new _w(O,Ee,e,ft),Le=new oT(O,Ee),Ve.reverseDepthBuffer&&v&&Le.buffers.depth.setReversed(!0),it=new Cw(O),Oe=new XE,D=new lT(O,Ee,Le,Oe,Ve,ft,it),C=new yw(T),Z=new ww(T),de=new NS(O),Lt=new gw(O,de),xe=new Tw(O,de,it,Lt),pe=new Pw(O,xe,de,it),at=new Rw(O,Ve,D),Te=new xw(Oe),qe=new WE(T,C,Z,Ee,Ve,Lt,Te),De=new vT(T,Oe),Ge=new YE,pt=new JE(Ee),ot=new mw(T,C,Z,Le,pe,S,f),Xe=new rT(T,pe,Ve),X=new _T(O,it,Ve,Le),je=new vw(O,Ee,it),xt=new Aw(O,Ee,it),it.programs=qe.programs,T.capabilities=Ve,T.extensions=Ee,T.properties=Oe,T.renderLists=Ge,T.shadowMap=Xe,T.state=Le,T.info=it}Ie();const le=new mT(T,O);this.xr=le,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const b=Ee.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Ee.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(b){b!==void 0&&(G=b,this.setSize(oe,ue,!1))},this.getSize=function(b){return b.set(oe,ue)},this.setSize=function(b,j,ne=!0){if(le.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}oe=b,ue=j,t.width=Math.floor(b*G),t.height=Math.floor(j*G),ne===!0&&(t.style.width=b+"px",t.style.height=j+"px"),this.setViewport(0,0,b,j)},this.getDrawingBufferSize=function(b){return b.set(oe*G,ue*G).floor()},this.setDrawingBufferSize=function(b,j,ne){oe=b,ue=j,G=ne,t.width=Math.floor(b*ne),t.height=Math.floor(j*ne),this.setViewport(0,0,b,j)},this.getCurrentViewport=function(b){return b.copy(F)},this.getViewport=function(b){return b.copy(k)},this.setViewport=function(b,j,ne,re){b.isVector4?k.set(b.x,b.y,b.z,b.w):k.set(b,j,ne,re),Le.viewport(F.copy(k).multiplyScalar(G).round())},this.getScissor=function(b){return b.copy(ee)},this.setScissor=function(b,j,ne,re){b.isVector4?ee.set(b.x,b.y,b.z,b.w):ee.set(b,j,ne,re),Le.scissor($.copy(ee).multiplyScalar(G).round())},this.getScissorTest=function(){return Fe},this.setScissorTest=function(b){Le.setScissorTest(Fe=b)},this.setOpaqueSort=function(b){he=b},this.setTransparentSort=function(b){ae=b},this.getClearColor=function(b){return b.copy(ot.getClearColor())},this.setClearColor=function(){ot.setClearColor.apply(ot,arguments)},this.getClearAlpha=function(){return ot.getClearAlpha()},this.setClearAlpha=function(){ot.setClearAlpha.apply(ot,arguments)},this.clear=function(b=!0,j=!0,ne=!0){let re=0;if(b){let q=!1;if(z!==null){const be=z.texture.format;q=be===Ad||be===Td||be===Ed}if(q){const be=z.texture.type,Ce=be===gr||be===Es||be===ka||be===bo||be===Sd||be===Md,Je=ot.getClearColor(),Ke=ot.getClearAlpha(),lt=Je.r,ut=Je.g,et=Je.b;Ce?(M[0]=lt,M[1]=ut,M[2]=et,M[3]=Ke,O.clearBufferuiv(O.COLOR,0,M)):(w[0]=lt,w[1]=ut,w[2]=et,w[3]=Ke,O.clearBufferiv(O.COLOR,0,w))}else re|=O.COLOR_BUFFER_BIT}j&&(re|=O.DEPTH_BUFFER_BIT),ne&&(re|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O.clear(re)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",ke,!1),t.removeEventListener("webglcontextcreationerror",Ue,!1),Ge.dispose(),pt.dispose(),Oe.dispose(),C.dispose(),Z.dispose(),pe.dispose(),Lt.dispose(),X.dispose(),qe.dispose(),le.dispose(),le.removeEventListener("sessionstart",Ps),le.removeEventListener("sessionend",_r),qi.stop()};function me(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),V=!0}function ke(){console.log("THREE.WebGLRenderer: Context Restored."),V=!1;const b=it.autoReset,j=Xe.enabled,ne=Xe.autoUpdate,re=Xe.needsUpdate,q=Xe.type;Ie(),it.autoReset=b,Xe.enabled=j,Xe.autoUpdate=ne,Xe.needsUpdate=re,Xe.type=q}function Ue(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function dt(b){const j=b.target;j.removeEventListener("dispose",dt),Ot(j)}function Ot(b){Jt(b),Oe.remove(b)}function Jt(b){const j=Oe.get(b).programs;j!==void 0&&(j.forEach(function(ne){qe.releaseProgram(ne)}),b.isShaderMaterial&&qe.releaseShaderCache(b))}this.renderBufferDirect=function(b,j,ne,re,q,be){j===null&&(j=_t);const Ce=q.isMesh&&q.matrixWorld.determinant()<0,Je=qa(b,j,ne,re,q);Le.setMaterial(re,Ce);let Ke=ne.index,lt=1;if(re.wireframe===!0){if(Ke=xe.getWireframeAttribute(ne),Ke===void 0)return;lt=2}const ut=ne.drawRange,et=ne.attributes.position;let Mt=ut.start*lt,bt=(ut.start+ut.count)*lt;be!==null&&(Mt=Math.max(Mt,be.start*lt),bt=Math.min(bt,(be.start+be.count)*lt)),Ke!==null?(Mt=Math.max(Mt,0),bt=Math.min(bt,Ke.count)):et!=null&&(Mt=Math.max(Mt,0),bt=Math.min(bt,et.count));const St=bt-Mt;if(St<0||St===1/0)return;Lt.setup(q,re,Je,ne,Ke);let xn,mt=je;if(Ke!==null&&(xn=de.get(Ke),mt=xt,mt.setIndex(xn)),q.isMesh)re.wireframe===!0?(Le.setLineWidth(re.wireframeLinewidth*Re()),mt.setMode(O.LINES)):mt.setMode(O.TRIANGLES);else if(q.isLine){let nt=re.linewidth;nt===void 0&&(nt=1),Le.setLineWidth(nt*Re()),q.isLineSegments?mt.setMode(O.LINES):q.isLineLoop?mt.setMode(O.LINE_LOOP):mt.setMode(O.LINE_STRIP)}else q.isPoints?mt.setMode(O.POINTS):q.isSprite&&mt.setMode(O.TRIANGLES);if(q.isBatchedMesh)if(q._multiDrawInstances!==null)mt.renderMultiDrawInstances(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount,q._multiDrawInstances);else if(Ee.get("WEBGL_multi_draw"))mt.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{const nt=q._multiDrawStarts,xi=q._multiDrawCounts,Ct=q._multiDrawCount,yn=Ke?de.get(Ke).bytesPerElement:1,yi=Oe.get(re).currentProgram.getUniforms();for(let en=0;en<Ct;en++)yi.setValue(O,"_gl_DrawID",en),mt.render(nt[en]/yn,xi[en])}else if(q.isInstancedMesh)mt.renderInstances(Mt,St,q.count);else if(ne.isInstancedBufferGeometry){const nt=ne._maxInstanceCount!==void 0?ne._maxInstanceCount:1/0,xi=Math.min(ne.instanceCount,nt);mt.renderInstances(Mt,St,xi)}else mt.render(Mt,St)};function wt(b,j,ne){b.transparent===!0&&b.side===gi&&b.forceSinglePass===!1?(b.side=On,b.needsUpdate=!0,bs(b,j,ne),b.side=$r,b.needsUpdate=!0,bs(b,j,ne),b.side=gi):bs(b,j,ne)}this.compile=function(b,j,ne=null){ne===null&&(ne=b),_=pt.get(ne),_.init(j),P.push(_),ne.traverseVisible(function(q){q.isLight&&q.layers.test(j.layers)&&(_.pushLight(q),q.castShadow&&_.pushShadow(q))}),b!==ne&&b.traverseVisible(function(q){q.isLight&&q.layers.test(j.layers)&&(_.pushLight(q),q.castShadow&&_.pushShadow(q))}),_.setupLights();const re=new Set;return b.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;const be=q.material;if(be)if(Array.isArray(be))for(let Ce=0;Ce<be.length;Ce++){const Je=be[Ce];wt(Je,ne,q),re.add(Je)}else wt(be,ne,q),re.add(be)}),P.pop(),_=null,re},this.compileAsync=function(b,j,ne=null){const re=this.compile(b,j,ne);return new Promise(q=>{function be(){if(re.forEach(function(Ce){Oe.get(Ce).currentProgram.isReady()&&re.delete(Ce)}),re.size===0){q(b);return}setTimeout(be,10)}Ee.get("KHR_parallel_shader_compile")!==null?be():setTimeout(be,10)})};let Bn=null;function bn(b){Bn&&Bn(b)}function Ps(){qi.stop()}function _r(){qi.start()}const qi=new Iv;qi.setAnimationLoop(bn),typeof self<"u"&&qi.setContext(self),this.setAnimationLoop=function(b){Bn=b,le.setAnimationLoop(b),b===null?qi.stop():qi.start()},le.addEventListener("sessionstart",Ps),le.addEventListener("sessionend",_r),this.render=function(b,j){if(j!==void 0&&j.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(V===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),j.parent===null&&j.matrixWorldAutoUpdate===!0&&j.updateMatrixWorld(),le.enabled===!0&&le.isPresenting===!0&&(le.cameraAutoUpdate===!0&&le.updateCamera(j),j=le.getCamera()),b.isScene===!0&&b.onBeforeRender(T,b,j,z),_=pt.get(b,P.length),_.init(j),P.push(_),Ae.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),J.setFromProjectionMatrix(Ae),we=this.localClippingEnabled,fe=Te.init(this.clippingPlanes,we),y=Ge.get(b,L.length),y.init(),L.push(y),le.enabled===!0&&le.isPresenting===!0){const be=T.xr.getDepthSensingMesh();be!==null&&Ki(be,j,-1/0,T.sortObjects)}Ki(b,j,0,T.sortObjects),y.finish(),T.sortObjects===!0&&y.sort(he,ae),_e=le.enabled===!1||le.isPresenting===!1||le.hasDepthSensing()===!1,_e&&ot.addToRenderList(y,b),this.info.render.frame++,fe===!0&&Te.beginShadows();const ne=_.state.shadowsArray;Xe.render(ne,b,j),fe===!0&&Te.endShadows(),this.info.autoReset===!0&&this.info.reset();const re=y.opaque,q=y.transmissive;if(_.setupLights(),j.isArrayCamera){const be=j.cameras;if(q.length>0)for(let Ce=0,Je=be.length;Ce<Je;Ce++){const Ke=be[Ce];Qr(re,q,b,Ke)}_e&&ot.render(b);for(let Ce=0,Je=be.length;Ce<Je;Ce++){const Ke=be[Ce];Zr(y,b,Ke,Ke.viewport)}}else q.length>0&&Qr(re,q,b,j),_e&&ot.render(b),Zr(y,b,j);z!==null&&(D.updateMultisampleRenderTarget(z),D.updateRenderTargetMipmap(z)),b.isScene===!0&&b.onAfterRender(T,b,j),Lt.resetDefaultState(),R=-1,A=null,P.pop(),P.length>0?(_=P[P.length-1],fe===!0&&Te.setGlobalState(T.clippingPlanes,_.state.camera)):_=null,L.pop(),L.length>0?y=L[L.length-1]:y=null};function Ki(b,j,ne,re){if(b.visible===!1)return;if(b.layers.test(j.layers)){if(b.isGroup)ne=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(j);else if(b.isLight)_.pushLight(b),b.castShadow&&_.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||J.intersectsSprite(b)){re&&Ze.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Ae);const Ce=pe.update(b),Je=b.material;Je.visible&&y.push(b,Ce,Je,ne,Ze.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||J.intersectsObject(b))){const Ce=pe.update(b),Je=b.material;if(re&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ze.copy(b.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),Ze.copy(Ce.boundingSphere.center)),Ze.applyMatrix4(b.matrixWorld).applyMatrix4(Ae)),Array.isArray(Je)){const Ke=Ce.groups;for(let lt=0,ut=Ke.length;lt<ut;lt++){const et=Ke[lt],Mt=Je[et.materialIndex];Mt&&Mt.visible&&y.push(b,Ce,Mt,ne,Ze.z,et)}}else Je.visible&&y.push(b,Ce,Je,ne,Ze.z,null)}}const be=b.children;for(let Ce=0,Je=be.length;Ce<Je;Ce++)Ki(be[Ce],j,ne,re)}function Zr(b,j,ne,re){const q=b.opaque,be=b.transmissive,Ce=b.transparent;_.setupLightsView(ne),fe===!0&&Te.setGlobalState(T.clippingPlanes,ne),re&&Le.viewport(F.copy(re)),q.length>0&&xr(q,j,ne),be.length>0&&xr(be,j,ne),Ce.length>0&&xr(Ce,j,ne),Le.buffers.depth.setTest(!0),Le.buffers.depth.setMask(!0),Le.buffers.color.setMask(!0),Le.setPolygonOffset(!1)}function Qr(b,j,ne,re){if((ne.isScene===!0?ne.overrideMaterial:null)!==null)return;_.state.transmissionRenderTarget[re.id]===void 0&&(_.state.transmissionRenderTarget[re.id]=new Ts(1,1,{generateMipmaps:!0,type:Ee.has("EXT_color_buffer_half_float")||Ee.has("EXT_color_buffer_float")?Wa:gr,minFilter:ws,samples:4,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:At.workingColorSpace}));const be=_.state.transmissionRenderTarget[re.id],Ce=re.viewport||F;be.setSize(Ce.z,Ce.w);const Je=T.getRenderTarget();T.setRenderTarget(be),T.getClearColor(ie),ce=T.getClearAlpha(),ce<1&&T.setClearColor(16777215,.5),T.clear(),_e&&ot.render(ne);const Ke=T.toneMapping;T.toneMapping=Kr;const lt=re.viewport;if(re.viewport!==void 0&&(re.viewport=void 0),_.setupLightsView(re),fe===!0&&Te.setGlobalState(T.clippingPlanes,re),xr(b,ne,re),D.updateMultisampleRenderTarget(be),D.updateRenderTargetMipmap(be),Ee.has("WEBGL_multisampled_render_to_texture")===!1){let ut=!1;for(let et=0,Mt=j.length;et<Mt;et++){const bt=j[et],St=bt.object,xn=bt.geometry,mt=bt.material,nt=bt.group;if(mt.side===gi&&St.layers.test(re.layers)){const xi=mt.side;mt.side=On,mt.needsUpdate=!0,ja(St,ne,re,xn,mt,nt),mt.side=xi,mt.needsUpdate=!0,ut=!0}}ut===!0&&(D.updateMultisampleRenderTarget(be),D.updateRenderTargetMipmap(be))}T.setRenderTarget(Je),T.setClearColor(ie,ce),lt!==void 0&&(re.viewport=lt),T.toneMapping=Ke}function xr(b,j,ne){const re=j.isScene===!0?j.overrideMaterial:null;for(let q=0,be=b.length;q<be;q++){const Ce=b[q],Je=Ce.object,Ke=Ce.geometry,lt=re===null?Ce.material:re,ut=Ce.group;Je.layers.test(ne.layers)&&ja(Je,j,ne,Ke,lt,ut)}}function ja(b,j,ne,re,q,be){b.onBeforeRender(T,j,ne,re,q,be),b.modelViewMatrix.multiplyMatrices(ne.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),q.onBeforeRender(T,j,ne,re,b,be),q.transparent===!0&&q.side===gi&&q.forceSinglePass===!1?(q.side=On,q.needsUpdate=!0,T.renderBufferDirect(ne,j,re,q,b,be),q.side=$r,q.needsUpdate=!0,T.renderBufferDirect(ne,j,re,q,b,be),q.side=gi):T.renderBufferDirect(ne,j,re,q,b,be),b.onAfterRender(T,j,ne,re,q,be)}function bs(b,j,ne){j.isScene!==!0&&(j=_t);const re=Oe.get(b),q=_.state.lights,be=_.state.shadowsArray,Ce=q.state.version,Je=qe.getParameters(b,q.state,be,j,ne),Ke=qe.getProgramCacheKey(Je);let lt=re.programs;re.environment=b.isMeshStandardMaterial?j.environment:null,re.fog=j.fog,re.envMap=(b.isMeshStandardMaterial?Z:C).get(b.envMap||re.environment),re.envMapRotation=re.environment!==null&&b.envMap===null?j.environmentRotation:b.envMapRotation,lt===void 0&&(b.addEventListener("dispose",dt),lt=new Map,re.programs=lt);let ut=lt.get(Ke);if(ut!==void 0){if(re.currentProgram===ut&&re.lightsStateVersion===Ce)return Ii(b,Je),ut}else Je.uniforms=qe.getUniforms(b),b.onBeforeCompile(Je,T),ut=qe.acquireProgram(Je,Ke),lt.set(Ke,ut),re.uniforms=Je.uniforms;const et=re.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(et.clippingPlanes=Te.uniform),Ii(b,Je),re.needsLights=jc(b),re.lightsStateVersion=Ce,re.needsLights&&(et.ambientLightColor.value=q.state.ambient,et.lightProbe.value=q.state.probe,et.directionalLights.value=q.state.directional,et.directionalLightShadows.value=q.state.directionalShadow,et.spotLights.value=q.state.spot,et.spotLightShadows.value=q.state.spotShadow,et.rectAreaLights.value=q.state.rectArea,et.ltc_1.value=q.state.rectAreaLTC1,et.ltc_2.value=q.state.rectAreaLTC2,et.pointLights.value=q.state.point,et.pointLightShadows.value=q.state.pointShadow,et.hemisphereLights.value=q.state.hemi,et.directionalShadowMap.value=q.state.directionalShadowMap,et.directionalShadowMatrix.value=q.state.directionalShadowMatrix,et.spotShadowMap.value=q.state.spotShadowMap,et.spotLightMatrix.value=q.state.spotLightMatrix,et.spotLightMap.value=q.state.spotLightMap,et.pointShadowMap.value=q.state.pointShadowMap,et.pointShadowMatrix.value=q.state.pointShadowMatrix),re.currentProgram=ut,re.uniformsList=null,ut}function Ya(b){if(b.uniformsList===null){const j=b.currentProgram.getUniforms();b.uniformsList=Fc.seqWithValue(j.seq,b.uniforms)}return b.uniformsList}function Ii(b,j){const ne=Oe.get(b);ne.outputColorSpace=j.outputColorSpace,ne.batching=j.batching,ne.batchingColor=j.batchingColor,ne.instancing=j.instancing,ne.instancingColor=j.instancingColor,ne.instancingMorph=j.instancingMorph,ne.skinning=j.skinning,ne.morphTargets=j.morphTargets,ne.morphNormals=j.morphNormals,ne.morphColors=j.morphColors,ne.morphTargetsCount=j.morphTargetsCount,ne.numClippingPlanes=j.numClippingPlanes,ne.numIntersection=j.numClipIntersection,ne.vertexAlphas=j.vertexAlphas,ne.vertexTangents=j.vertexTangents,ne.toneMapping=j.toneMapping}function qa(b,j,ne,re,q){j.isScene!==!0&&(j=_t),D.resetTextureUnits();const be=j.fog,Ce=re.isMeshStandardMaterial?j.environment:null,Je=z===null?T.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:Uo,Ke=(re.isMeshStandardMaterial?Z:C).get(re.envMap||Ce),lt=re.vertexColors===!0&&!!ne.attributes.color&&ne.attributes.color.itemSize===4,ut=!!ne.attributes.tangent&&(!!re.normalMap||re.anisotropy>0),et=!!ne.morphAttributes.position,Mt=!!ne.morphAttributes.normal,bt=!!ne.morphAttributes.color;let St=Kr;re.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(St=T.toneMapping);const xn=ne.morphAttributes.position||ne.morphAttributes.normal||ne.morphAttributes.color,mt=xn!==void 0?xn.length:0,nt=Oe.get(re),xi=_.state.lights;if(fe===!0&&(we===!0||b!==A)){const Ln=b===A&&re.id===R;Te.setState(re,b,Ln)}let Ct=!1;re.version===nt.__version?(nt.needsLights&&nt.lightsStateVersion!==xi.state.version||nt.outputColorSpace!==Je||q.isBatchedMesh&&nt.batching===!1||!q.isBatchedMesh&&nt.batching===!0||q.isBatchedMesh&&nt.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&nt.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&nt.instancing===!1||!q.isInstancedMesh&&nt.instancing===!0||q.isSkinnedMesh&&nt.skinning===!1||!q.isSkinnedMesh&&nt.skinning===!0||q.isInstancedMesh&&nt.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&nt.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&nt.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&nt.instancingMorph===!1&&q.morphTexture!==null||nt.envMap!==Ke||re.fog===!0&&nt.fog!==be||nt.numClippingPlanes!==void 0&&(nt.numClippingPlanes!==Te.numPlanes||nt.numIntersection!==Te.numIntersection)||nt.vertexAlphas!==lt||nt.vertexTangents!==ut||nt.morphTargets!==et||nt.morphNormals!==Mt||nt.morphColors!==bt||nt.toneMapping!==St||nt.morphTargetsCount!==mt)&&(Ct=!0):(Ct=!0,nt.__version=re.version);let yn=nt.currentProgram;Ct===!0&&(yn=bs(re,j,q));let yi=!1,en=!1,Ni=!1;const Ut=yn.getUniforms(),si=nt.uniforms;if(Le.useProgram(yn.program)&&(yi=!0,en=!0,Ni=!0),re.id!==R&&(R=re.id,en=!0),yi||A!==b){Le.buffers.depth.getReversed()?(ve.copy(b.projectionMatrix),cS(ve),uS(ve),Ut.setValue(O,"projectionMatrix",ve)):Ut.setValue(O,"projectionMatrix",b.projectionMatrix),Ut.setValue(O,"viewMatrix",b.matrixWorldInverse);const oi=Ut.map.cameraPosition;oi!==void 0&&oi.setValue(O,Be.setFromMatrixPosition(b.matrixWorld)),Ve.logarithmicDepthBuffer&&Ut.setValue(O,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(re.isMeshPhongMaterial||re.isMeshToonMaterial||re.isMeshLambertMaterial||re.isMeshBasicMaterial||re.isMeshStandardMaterial||re.isShaderMaterial)&&Ut.setValue(O,"isOrthographic",b.isOrthographicCamera===!0),A!==b&&(A=b,en=!0,Ni=!0)}if(q.isSkinnedMesh){Ut.setOptional(O,q,"bindMatrix"),Ut.setOptional(O,q,"bindMatrixInverse");const Ln=q.skeleton;Ln&&(Ln.boneTexture===null&&Ln.computeBoneTexture(),Ut.setValue(O,"boneTexture",Ln.boneTexture,D))}q.isBatchedMesh&&(Ut.setOptional(O,q,"batchingTexture"),Ut.setValue(O,"batchingTexture",q._matricesTexture,D),Ut.setOptional(O,q,"batchingIdTexture"),Ut.setValue(O,"batchingIdTexture",q._indirectTexture,D),Ut.setOptional(O,q,"batchingColorTexture"),q._colorsTexture!==null&&Ut.setValue(O,"batchingColorTexture",q._colorsTexture,D));const $i=ne.morphAttributes;if(($i.position!==void 0||$i.normal!==void 0||$i.color!==void 0)&&at.update(q,ne,yn),(en||nt.receiveShadow!==q.receiveShadow)&&(nt.receiveShadow=q.receiveShadow,Ut.setValue(O,"receiveShadow",q.receiveShadow)),re.isMeshGouraudMaterial&&re.envMap!==null&&(si.envMap.value=Ke,si.flipEnvMap.value=Ke.isCubeTexture&&Ke.isRenderTargetTexture===!1?-1:1),re.isMeshStandardMaterial&&re.envMap===null&&j.environment!==null&&(si.envMapIntensity.value=j.environmentIntensity),en&&(Ut.setValue(O,"toneMappingExposure",T.toneMappingExposure),nt.needsLights&&Ka(si,Ni),be&&re.fog===!0&&De.refreshFogUniforms(si,be),De.refreshMaterialUniforms(si,re,G,ue,_.state.transmissionRenderTarget[b.id]),Fc.upload(O,Ya(nt),si,D)),re.isShaderMaterial&&re.uniformsNeedUpdate===!0&&(Fc.upload(O,Ya(nt),si,D),re.uniformsNeedUpdate=!1),re.isSpriteMaterial&&Ut.setValue(O,"center",q.center),Ut.setValue(O,"modelViewMatrix",q.modelViewMatrix),Ut.setValue(O,"normalMatrix",q.normalMatrix),Ut.setValue(O,"modelMatrix",q.matrixWorld),re.isShaderMaterial||re.isRawShaderMaterial){const Ln=re.uniformsGroups;for(let oi=0,Hn=Ln.length;oi<Hn;oi++){const $a=Ln[oi];X.update($a,yn),X.bind($a,yn)}}return yn}function Ka(b,j){b.ambientLightColor.needsUpdate=j,b.lightProbe.needsUpdate=j,b.directionalLights.needsUpdate=j,b.directionalLightShadows.needsUpdate=j,b.pointLights.needsUpdate=j,b.pointLightShadows.needsUpdate=j,b.spotLights.needsUpdate=j,b.spotLightShadows.needsUpdate=j,b.rectAreaLights.needsUpdate=j,b.hemisphereLights.needsUpdate=j}function jc(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(b,j,ne){Oe.get(b.texture).__webglTexture=j,Oe.get(b.depthTexture).__webglTexture=ne;const re=Oe.get(b);re.__hasExternalTextures=!0,re.__autoAllocateDepthBuffer=ne===void 0,re.__autoAllocateDepthBuffer||Ee.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),re.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,j){const ne=Oe.get(b);ne.__webglFramebuffer=j,ne.__useDefaultFramebuffer=j===void 0},this.setRenderTarget=function(b,j=0,ne=0){z=b,I=j,N=ne;let re=!0,q=null,be=!1,Ce=!1;if(b){const Ke=Oe.get(b);if(Ke.__useDefaultFramebuffer!==void 0)Le.bindFramebuffer(O.FRAMEBUFFER,null),re=!1;else if(Ke.__webglFramebuffer===void 0)D.setupRenderTarget(b);else if(Ke.__hasExternalTextures)D.rebindTextures(b,Oe.get(b.texture).__webglTexture,Oe.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const et=b.depthTexture;if(Ke.__boundDepthTexture!==et){if(et!==null&&Oe.has(et)&&(b.width!==et.image.width||b.height!==et.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(b)}}const lt=b.texture;(lt.isData3DTexture||lt.isDataArrayTexture||lt.isCompressedArrayTexture)&&(Ce=!0);const ut=Oe.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(ut[j])?q=ut[j][ne]:q=ut[j],be=!0):b.samples>0&&D.useMultisampledRTT(b)===!1?q=Oe.get(b).__webglMultisampledFramebuffer:Array.isArray(ut)?q=ut[ne]:q=ut,F.copy(b.viewport),$.copy(b.scissor),Y=b.scissorTest}else F.copy(k).multiplyScalar(G).floor(),$.copy(ee).multiplyScalar(G).floor(),Y=Fe;if(Le.bindFramebuffer(O.FRAMEBUFFER,q)&&re&&Le.drawBuffers(b,q),Le.viewport(F),Le.scissor($),Le.setScissorTest(Y),be){const Ke=Oe.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ke.__webglTexture,ne)}else if(Ce){const Ke=Oe.get(b.texture),lt=j||0;O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ke.__webglTexture,ne||0,lt)}R=-1},this.readRenderTargetPixels=function(b,j,ne,re,q,be,Ce){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Je=Oe.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ce!==void 0&&(Je=Je[Ce]),Je){Le.bindFramebuffer(O.FRAMEBUFFER,Je);try{const Ke=b.texture,lt=Ke.format,ut=Ke.type;if(!Ve.textureFormatReadable(lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ve.textureTypeReadable(ut)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}j>=0&&j<=b.width-re&&ne>=0&&ne<=b.height-q&&O.readPixels(j,ne,re,q,ft.convert(lt),ft.convert(ut),be)}finally{const Ke=z!==null?Oe.get(z).__webglFramebuffer:null;Le.bindFramebuffer(O.FRAMEBUFFER,Ke)}}},this.readRenderTargetPixelsAsync=async function(b,j,ne,re,q,be,Ce){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Je=Oe.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ce!==void 0&&(Je=Je[Ce]),Je){const Ke=b.texture,lt=Ke.format,ut=Ke.type;if(!Ve.textureFormatReadable(lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ve.textureTypeReadable(ut))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(j>=0&&j<=b.width-re&&ne>=0&&ne<=b.height-q){Le.bindFramebuffer(O.FRAMEBUFFER,Je);const et=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,et),O.bufferData(O.PIXEL_PACK_BUFFER,be.byteLength,O.STREAM_READ),O.readPixels(j,ne,re,q,ft.convert(lt),ft.convert(ut),0);const Mt=z!==null?Oe.get(z).__webglFramebuffer:null;Le.bindFramebuffer(O.FRAMEBUFFER,Mt);const bt=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await lS(O,bt,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,et),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,be),O.deleteBuffer(et),O.deleteSync(bt),be}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,j=null,ne=0){b.isTexture!==!0&&(Ra("WebGLRenderer: copyFramebufferToTexture function signature has changed."),j=arguments[0]||null,b=arguments[1]);const re=Math.pow(2,-ne),q=Math.floor(b.image.width*re),be=Math.floor(b.image.height*re),Ce=j!==null?j.x:0,Je=j!==null?j.y:0;D.setTexture2D(b,0),O.copyTexSubImage2D(O.TEXTURE_2D,ne,0,0,Ce,Je,q,be),Le.unbindTexture()},this.copyTextureToTexture=function(b,j,ne=null,re=null,q=0){b.isTexture!==!0&&(Ra("WebGLRenderer: copyTextureToTexture function signature has changed."),re=arguments[0]||null,b=arguments[1],j=arguments[2],q=arguments[3]||0,ne=null);let be,Ce,Je,Ke,lt,ut,et,Mt,bt;const St=b.isCompressedTexture?b.mipmaps[q]:b.image;ne!==null?(be=ne.max.x-ne.min.x,Ce=ne.max.y-ne.min.y,Je=ne.isBox3?ne.max.z-ne.min.z:1,Ke=ne.min.x,lt=ne.min.y,ut=ne.isBox3?ne.min.z:0):(be=St.width,Ce=St.height,Je=St.depth||1,Ke=0,lt=0,ut=0),re!==null?(et=re.x,Mt=re.y,bt=re.z):(et=0,Mt=0,bt=0);const xn=ft.convert(j.format),mt=ft.convert(j.type);let nt;j.isData3DTexture?(D.setTexture3D(j,0),nt=O.TEXTURE_3D):j.isDataArrayTexture||j.isCompressedArrayTexture?(D.setTexture2DArray(j,0),nt=O.TEXTURE_2D_ARRAY):(D.setTexture2D(j,0),nt=O.TEXTURE_2D),O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,j.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,j.unpackAlignment);const xi=O.getParameter(O.UNPACK_ROW_LENGTH),Ct=O.getParameter(O.UNPACK_IMAGE_HEIGHT),yn=O.getParameter(O.UNPACK_SKIP_PIXELS),yi=O.getParameter(O.UNPACK_SKIP_ROWS),en=O.getParameter(O.UNPACK_SKIP_IMAGES);O.pixelStorei(O.UNPACK_ROW_LENGTH,St.width),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,St.height),O.pixelStorei(O.UNPACK_SKIP_PIXELS,Ke),O.pixelStorei(O.UNPACK_SKIP_ROWS,lt),O.pixelStorei(O.UNPACK_SKIP_IMAGES,ut);const Ni=b.isDataArrayTexture||b.isData3DTexture,Ut=j.isDataArrayTexture||j.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const si=Oe.get(b),$i=Oe.get(j),Ln=Oe.get(si.__renderTarget),oi=Oe.get($i.__renderTarget);Le.bindFramebuffer(O.READ_FRAMEBUFFER,Ln.__webglFramebuffer),Le.bindFramebuffer(O.DRAW_FRAMEBUFFER,oi.__webglFramebuffer);for(let Hn=0;Hn<Je;Hn++)Ni&&O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Oe.get(b).__webglTexture,q,ut+Hn),b.isDepthTexture?(Ut&&O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Oe.get(j).__webglTexture,q,bt+Hn),O.blitFramebuffer(Ke,lt,be,Ce,et,Mt,be,Ce,O.DEPTH_BUFFER_BIT,O.NEAREST)):Ut?O.copyTexSubImage3D(nt,q,et,Mt,bt+Hn,Ke,lt,be,Ce):O.copyTexSubImage2D(nt,q,et,Mt,bt+Hn,Ke,lt,be,Ce);Le.bindFramebuffer(O.READ_FRAMEBUFFER,null),Le.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else Ut?b.isDataTexture||b.isData3DTexture?O.texSubImage3D(nt,q,et,Mt,bt,be,Ce,Je,xn,mt,St.data):j.isCompressedArrayTexture?O.compressedTexSubImage3D(nt,q,et,Mt,bt,be,Ce,Je,xn,St.data):O.texSubImage3D(nt,q,et,Mt,bt,be,Ce,Je,xn,mt,St):b.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,q,et,Mt,be,Ce,xn,mt,St.data):b.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,q,et,Mt,St.width,St.height,xn,St.data):O.texSubImage2D(O.TEXTURE_2D,q,et,Mt,be,Ce,xn,mt,St);O.pixelStorei(O.UNPACK_ROW_LENGTH,xi),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Ct),O.pixelStorei(O.UNPACK_SKIP_PIXELS,yn),O.pixelStorei(O.UNPACK_SKIP_ROWS,yi),O.pixelStorei(O.UNPACK_SKIP_IMAGES,en),q===0&&j.generateMipmaps&&O.generateMipmap(nt),Le.unbindTexture()},this.copyTextureToTexture3D=function(b,j,ne=null,re=null,q=0){return b.isTexture!==!0&&(Ra("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ne=arguments[0]||null,re=arguments[1]||null,b=arguments[2],j=arguments[3],q=arguments[4]||0),Ra('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,j,ne,re,q)},this.initRenderTarget=function(b){Oe.get(b).__webglFramebuffer===void 0&&D.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?D.setTextureCube(b,0):b.isData3DTexture?D.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?D.setTexture2DArray(b,0):D.setTexture2D(b,0),Le.unbindTexture()},this.resetState=function(){I=0,N=0,z=null,Le.reset(),Lt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return dr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=At._getDrawingBufferColorSpace(e),t.unpackColorSpace=At._getUnpackColorSpace()}}class bd{constructor(e,t=1,r=1e3){this.isFog=!0,this.name="",this.color=new ht(e),this.near=t,this.far=r}clone(){return new bd(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class yT extends fn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vi,this.environmentIntensity=1,this.environmentRotation=new vi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class ST extends Rn{constructor(e=null,t=1,r=1,o,a,c,u,f,d=ii,m=ii,g,v){super(null,c,u,f,d,m,o,a,g,v),this.isDataTexture=!0,this.image={data:e,width:t,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class d0 extends ri{constructor(e,t,r,o=1){super(e,t,r),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=o}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const po=new It,p0=new It,xc=[],m0=new Rs,MT=new It,wa=new Pt,Ea=new Oo;class wT extends Pt{constructor(e,t,r){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new d0(new Float32Array(r*16),16),this.instanceColor=null,this.morphTexture=null,this.count=r,this.boundingBox=null,this.boundingSphere=null;for(let o=0;o<r;o++)this.setMatrixAt(o,MT)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Rs),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let r=0;r<t;r++)this.getMatrixAt(r,po),m0.copy(e.boundingBox).applyMatrix4(po),this.boundingBox.union(m0)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Oo),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let r=0;r<t;r++)this.getMatrixAt(r,po),Ea.copy(e.boundingSphere).applyMatrix4(po),this.boundingSphere.union(Ea)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const r=t.morphTargetInfluences,o=this.morphTexture.source.data.data,a=r.length+1,c=e*a+1;for(let u=0;u<r.length;u++)r[u]=o[c+u]}raycast(e,t){const r=this.matrixWorld,o=this.count;if(wa.geometry=this.geometry,wa.material=this.material,wa.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ea.copy(this.boundingSphere),Ea.applyMatrix4(r),e.ray.intersectsSphere(Ea)!==!1))for(let a=0;a<o;a++){this.getMatrixAt(a,po),p0.multiplyMatrices(r,po),wa.matrixWorld=p0,wa.raycast(e,xc);for(let c=0,u=xc.length;c<u;c++){const f=xc[c];f.instanceId=a,f.object=this,t.push(f)}xc.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new d0(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const r=t.morphTargetInfluences,o=r.length+1;this.morphTexture===null&&(this.morphTexture=new ST(new Float32Array(o*this.count),o,this.count,wd,Xi));const a=this.morphTexture.source.data.data;let c=0;for(let d=0;d<r.length;d++)c+=r[d];const u=this.geometry.morphTargetsRelative?1:1-c,f=o*e;a[f]=u,a.set(r,f+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Bv extends ko{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new ht(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const g0=new It,ld=new Tv,yc=new Oo,Sc=new B;class ET extends fn{constructor(e=new _i,t=new Bv){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const r=this.geometry,o=this.matrixWorld,a=e.params.Points.threshold,c=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),yc.copy(r.boundingSphere),yc.applyMatrix4(o),yc.radius+=a,e.ray.intersectsSphere(yc)===!1)return;g0.copy(o).invert(),ld.copy(e.ray).applyMatrix4(g0);const u=a/((this.scale.x+this.scale.y+this.scale.z)/3),f=u*u,d=r.index,g=r.attributes.position;if(d!==null){const v=Math.max(0,c.start),S=Math.min(d.count,c.start+c.count);for(let M=v,w=S;M<w;M++){const y=d.getX(M);Sc.fromBufferAttribute(g,y),v0(Sc,y,f,o,e,t,this)}}else{const v=Math.max(0,c.start),S=Math.min(g.count,c.start+c.count);for(let M=v,w=S;M<w;M++)Sc.fromBufferAttribute(g,M),v0(Sc,M,f,o,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const o=t[r[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=o.length;a<c;a++){const u=o[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=a}}}}}function v0(i,e,t,r,o,a,c){const u=ld.distanceSqToPoint(i);if(u<t){const f=new B;ld.closestPointToPoint(i,f),f.applyMatrix4(r);const d=o.ray.origin.distanceTo(f);if(d<o.near||d>o.far)return;a.push({distance:d,distanceToRay:Math.sqrt(u),point:f,index:e,face:null,faceIndex:null,barycoord:null,object:c})}}class Gc extends Rn{constructor(e,t,r,o,a,c,u,f,d){super(e,t,r,o,a,c,u,f,d),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Yi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const r=this.getUtoTmapping(e);return this.getPoint(r,t)}getPoints(e=5){const t=[];for(let r=0;r<=e;r++)t.push(this.getPoint(r/e));return t}getSpacedPoints(e=5){const t=[];for(let r=0;r<=e;r++)t.push(this.getPointAt(r/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let r,o=this.getPoint(0),a=0;t.push(0);for(let c=1;c<=e;c++)r=this.getPoint(c/e),a+=r.distanceTo(o),t.push(a),o=r;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const r=this.getLengths();let o=0;const a=r.length;let c;t?c=t:c=e*r[a-1];let u=0,f=a-1,d;for(;u<=f;)if(o=Math.floor(u+(f-u)/2),d=r[o]-c,d<0)u=o+1;else if(d>0)f=o-1;else{f=o;break}if(o=f,r[o]===c)return o/(a-1);const m=r[o],v=r[o+1]-m,S=(c-m)/v;return(o+S)/(a-1)}getTangent(e,t){let o=e-1e-4,a=e+1e-4;o<0&&(o=0),a>1&&(a=1);const c=this.getPoint(o),u=this.getPoint(a),f=t||(c.isVector2?new ze:new B);return f.copy(u).sub(c).normalize(),f}getTangentAt(e,t){const r=this.getUtoTmapping(e);return this.getTangent(r,t)}computeFrenetFrames(e,t){const r=new B,o=[],a=[],c=[],u=new B,f=new It;for(let S=0;S<=e;S++){const M=S/e;o[S]=this.getTangentAt(M,new B)}a[0]=new B,c[0]=new B;let d=Number.MAX_VALUE;const m=Math.abs(o[0].x),g=Math.abs(o[0].y),v=Math.abs(o[0].z);m<=d&&(d=m,r.set(1,0,0)),g<=d&&(d=g,r.set(0,1,0)),v<=d&&r.set(0,0,1),u.crossVectors(o[0],r).normalize(),a[0].crossVectors(o[0],u),c[0].crossVectors(o[0],a[0]);for(let S=1;S<=e;S++){if(a[S]=a[S-1].clone(),c[S]=c[S-1].clone(),u.crossVectors(o[S-1],o[S]),u.length()>Number.EPSILON){u.normalize();const M=Math.acos(vn(o[S-1].dot(o[S]),-1,1));a[S].applyMatrix4(f.makeRotationAxis(u,M))}c[S].crossVectors(o[S],a[S])}if(t===!0){let S=Math.acos(vn(a[0].dot(a[e]),-1,1));S/=e,o[0].dot(u.crossVectors(a[0],a[e]))>0&&(S=-S);for(let M=1;M<=e;M++)a[M].applyMatrix4(f.makeRotationAxis(o[M],S*M)),c[M].crossVectors(o[M],a[M])}return{tangents:o,normals:a,binormals:c}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Ld extends Yi{constructor(e=0,t=0,r=1,o=1,a=0,c=Math.PI*2,u=!1,f=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=r,this.yRadius=o,this.aStartAngle=a,this.aEndAngle=c,this.aClockwise=u,this.aRotation=f}getPoint(e,t=new ze){const r=t,o=Math.PI*2;let a=this.aEndAngle-this.aStartAngle;const c=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=o;for(;a>o;)a-=o;a<Number.EPSILON&&(c?a=0:a=o),this.aClockwise===!0&&!c&&(a===o?a=-o:a=a-o);const u=this.aStartAngle+e*a;let f=this.aX+this.xRadius*Math.cos(u),d=this.aY+this.yRadius*Math.sin(u);if(this.aRotation!==0){const m=Math.cos(this.aRotation),g=Math.sin(this.aRotation),v=f-this.aX,S=d-this.aY;f=v*m-S*g+this.aX,d=v*g+S*m+this.aY}return r.set(f,d)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class TT extends Ld{constructor(e,t,r,o,a,c){super(e,t,r,r,o,a,c),this.isArcCurve=!0,this.type="ArcCurve"}}function Dd(){let i=0,e=0,t=0,r=0;function o(a,c,u,f){i=a,e=u,t=-3*a+3*c-2*u-f,r=2*a-2*c+u+f}return{initCatmullRom:function(a,c,u,f,d){o(c,u,d*(u-a),d*(f-c))},initNonuniformCatmullRom:function(a,c,u,f,d,m,g){let v=(c-a)/d-(u-a)/(d+m)+(u-c)/m,S=(u-c)/m-(f-c)/(m+g)+(f-u)/g;v*=m,S*=m,o(c,u,v,S)},calc:function(a){const c=a*a,u=c*a;return i+e*a+t*c+r*u}}}const Mc=new B,rf=new Dd,sf=new Dd,of=new Dd;class AT extends Yi{constructor(e=[],t=!1,r="centripetal",o=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=r,this.tension=o}getPoint(e,t=new B){const r=t,o=this.points,a=o.length,c=(a-(this.closed?0:1))*e;let u=Math.floor(c),f=c-u;this.closed?u+=u>0?0:(Math.floor(Math.abs(u)/a)+1)*a:f===0&&u===a-1&&(u=a-2,f=1);let d,m;this.closed||u>0?d=o[(u-1)%a]:(Mc.subVectors(o[0],o[1]).add(o[0]),d=Mc);const g=o[u%a],v=o[(u+1)%a];if(this.closed||u+2<a?m=o[(u+2)%a]:(Mc.subVectors(o[a-1],o[a-2]).add(o[a-1]),m=Mc),this.curveType==="centripetal"||this.curveType==="chordal"){const S=this.curveType==="chordal"?.5:.25;let M=Math.pow(d.distanceToSquared(g),S),w=Math.pow(g.distanceToSquared(v),S),y=Math.pow(v.distanceToSquared(m),S);w<1e-4&&(w=1),M<1e-4&&(M=w),y<1e-4&&(y=w),rf.initNonuniformCatmullRom(d.x,g.x,v.x,m.x,M,w,y),sf.initNonuniformCatmullRom(d.y,g.y,v.y,m.y,M,w,y),of.initNonuniformCatmullRom(d.z,g.z,v.z,m.z,M,w,y)}else this.curveType==="catmullrom"&&(rf.initCatmullRom(d.x,g.x,v.x,m.x,this.tension),sf.initCatmullRom(d.y,g.y,v.y,m.y,this.tension),of.initCatmullRom(d.z,g.z,v.z,m.z,this.tension));return r.set(rf.calc(f),sf.calc(f),of.calc(f)),r}copy(e){super.copy(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(o.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,r=this.points.length;t<r;t++){const o=this.points[t];e.points.push(o.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(new B().fromArray(o))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function _0(i,e,t,r,o){const a=(r-e)*.5,c=(o-t)*.5,u=i*i,f=i*u;return(2*t-2*r+a+c)*f+(-3*t+3*r-2*a-c)*u+a*i+t}function CT(i,e){const t=1-i;return t*t*e}function RT(i,e){return 2*(1-i)*i*e}function PT(i,e){return i*i*e}function Da(i,e,t,r){return CT(i,e)+RT(i,t)+PT(i,r)}function bT(i,e){const t=1-i;return t*t*t*e}function LT(i,e){const t=1-i;return 3*t*t*i*e}function DT(i,e){return 3*(1-i)*i*i*e}function IT(i,e){return i*i*i*e}function Ia(i,e,t,r,o){return bT(i,e)+LT(i,t)+DT(i,r)+IT(i,o)}class Hv extends Yi{constructor(e=new ze,t=new ze,r=new ze,o=new ze){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=r,this.v3=o}getPoint(e,t=new ze){const r=t,o=this.v0,a=this.v1,c=this.v2,u=this.v3;return r.set(Ia(e,o.x,a.x,c.x,u.x),Ia(e,o.y,a.y,c.y,u.y)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class NT extends Yi{constructor(e=new B,t=new B,r=new B,o=new B){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=r,this.v3=o}getPoint(e,t=new B){const r=t,o=this.v0,a=this.v1,c=this.v2,u=this.v3;return r.set(Ia(e,o.x,a.x,c.x,u.x),Ia(e,o.y,a.y,c.y,u.y),Ia(e,o.z,a.z,c.z,u.z)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Vv extends Yi{constructor(e=new ze,t=new ze){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ze){const r=t;return e===1?r.copy(this.v2):(r.copy(this.v2).sub(this.v1),r.multiplyScalar(e).add(this.v1)),r}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ze){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class UT extends Yi{constructor(e=new B,t=new B){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new B){const r=t;return e===1?r.copy(this.v2):(r.copy(this.v2).sub(this.v1),r.multiplyScalar(e).add(this.v1)),r}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Gv extends Yi{constructor(e=new ze,t=new ze,r=new ze){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=r}getPoint(e,t=new ze){const r=t,o=this.v0,a=this.v1,c=this.v2;return r.set(Da(e,o.x,a.x,c.x),Da(e,o.y,a.y,c.y)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class FT extends Yi{constructor(e=new B,t=new B,r=new B){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=r}getPoint(e,t=new B){const r=t,o=this.v0,a=this.v1,c=this.v2;return r.set(Da(e,o.x,a.x,c.x),Da(e,o.y,a.y,c.y),Da(e,o.z,a.z,c.z)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Wv extends Yi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ze){const r=t,o=this.points,a=(o.length-1)*e,c=Math.floor(a),u=a-c,f=o[c===0?c:c-1],d=o[c],m=o[c>o.length-2?o.length-1:c+1],g=o[c>o.length-3?o.length-1:c+2];return r.set(_0(u,f.x,d.x,m.x,g.x),_0(u,f.y,d.y,m.y,g.y)),r}copy(e){super.copy(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,r=this.points.length;t<r;t++){const o=this.points[t];e.points.push(o.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(new ze().fromArray(o))}return this}}var cd=Object.freeze({__proto__:null,ArcCurve:TT,CatmullRomCurve3:AT,CubicBezierCurve:Hv,CubicBezierCurve3:NT,EllipseCurve:Ld,LineCurve:Vv,LineCurve3:UT,QuadraticBezierCurve:Gv,QuadraticBezierCurve3:FT,SplineCurve:Wv});class OT extends Yi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const r=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new cd[r](t,e))}return this}getPoint(e,t){const r=e*this.getLength(),o=this.getCurveLengths();let a=0;for(;a<o.length;){if(o[a]>=r){const c=o[a]-r,u=this.curves[a],f=u.getLength(),d=f===0?0:1-c/f;return u.getPointAt(d,t)}a++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let r=0,o=this.curves.length;r<o;r++)t+=this.curves[r].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let r=0;r<=e;r++)t.push(this.getPoint(r/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let r;for(let o=0,a=this.curves;o<a.length;o++){const c=a[o],u=c.isEllipseCurve?e*2:c.isLineCurve||c.isLineCurve3?1:c.isSplineCurve?e*c.points.length:e,f=c.getPoints(u);for(let d=0;d<f.length;d++){const m=f[d];r&&r.equals(m)||(t.push(m),r=m)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,r=e.curves.length;t<r;t++){const o=e.curves[t];this.curves.push(o.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,r=this.curves.length;t<r;t++){const o=this.curves[t];e.curves.push(o.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,r=e.curves.length;t<r;t++){const o=e.curves[t];this.curves.push(new cd[o.type]().fromJSON(o))}return this}}class x0 extends OT{constructor(e){super(),this.type="Path",this.currentPoint=new ze,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,r=e.length;t<r;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const r=new Vv(this.currentPoint.clone(),new ze(e,t));return this.curves.push(r),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,r,o){const a=new Gv(this.currentPoint.clone(),new ze(e,t),new ze(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}bezierCurveTo(e,t,r,o,a,c){const u=new Hv(this.currentPoint.clone(),new ze(e,t),new ze(r,o),new ze(a,c));return this.curves.push(u),this.currentPoint.set(a,c),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),r=new Wv(t);return this.curves.push(r),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,r,o,a,c){const u=this.currentPoint.x,f=this.currentPoint.y;return this.absarc(e+u,t+f,r,o,a,c),this}absarc(e,t,r,o,a,c){return this.absellipse(e,t,r,r,o,a,c),this}ellipse(e,t,r,o,a,c,u,f){const d=this.currentPoint.x,m=this.currentPoint.y;return this.absellipse(e+d,t+m,r,o,a,c,u,f),this}absellipse(e,t,r,o,a,c,u,f){const d=new Ld(e,t,r,o,a,c,u,f);if(this.curves.length>0){const g=d.getPoint(0);g.equals(this.currentPoint)||this.lineTo(g.x,g.y)}this.curves.push(d);const m=d.getPoint(1);return this.currentPoint.copy(m),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Di extends _i{constructor(e=1,t=1,r=1,o=32,a=1,c=!1,u=0,f=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:r,radialSegments:o,heightSegments:a,openEnded:c,thetaStart:u,thetaLength:f};const d=this;o=Math.floor(o),a=Math.floor(a);const m=[],g=[],v=[],S=[];let M=0;const w=[],y=r/2;let _=0;L(),c===!1&&(e>0&&P(!0),t>0&&P(!1)),this.setIndex(m),this.setAttribute("position",new zn(g,3)),this.setAttribute("normal",new zn(v,3)),this.setAttribute("uv",new zn(S,2));function L(){const T=new B,V=new B;let I=0;const N=(t-e)/r;for(let z=0;z<=a;z++){const R=[],A=z/a,F=A*(t-e)+e;for(let $=0;$<=o;$++){const Y=$/o,ie=Y*f+u,ce=Math.sin(ie),oe=Math.cos(ie);V.x=F*ce,V.y=-A*r+y,V.z=F*oe,g.push(V.x,V.y,V.z),T.set(ce,N,oe).normalize(),v.push(T.x,T.y,T.z),S.push(Y,1-A),R.push(M++)}w.push(R)}for(let z=0;z<o;z++)for(let R=0;R<a;R++){const A=w[R][z],F=w[R+1][z],$=w[R+1][z+1],Y=w[R][z+1];(e>0||R!==0)&&(m.push(A,F,Y),I+=3),(t>0||R!==a-1)&&(m.push(F,$,Y),I+=3)}d.addGroup(_,I,0),_+=I}function P(T){const V=M,I=new ze,N=new B;let z=0;const R=T===!0?e:t,A=T===!0?1:-1;for(let $=1;$<=o;$++)g.push(0,y*A,0),v.push(0,A,0),S.push(.5,.5),M++;const F=M;for(let $=0;$<=o;$++){const ie=$/o*f+u,ce=Math.cos(ie),oe=Math.sin(ie);N.x=R*oe,N.y=y*A,N.z=R*ce,g.push(N.x,N.y,N.z),v.push(0,A,0),I.x=ce*.5+.5,I.y=oe*.5*A+.5,S.push(I.x,I.y),M++}for(let $=0;$<o;$++){const Y=V+$,ie=F+$;T===!0?m.push(ie,ie+1,Y):m.push(ie+1,ie,Y),z+=3}d.addGroup(_,z,T===!0?1:2),_+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Di(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Id extends Di{constructor(e=1,t=1,r=32,o=1,a=!1,c=0,u=Math.PI*2){super(0,e,t,r,o,a,c,u),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:r,heightSegments:o,openEnded:a,thetaStart:c,thetaLength:u}}static fromJSON(e){return new Id(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Xv extends x0{constructor(e){super(e),this.uuid=Cs(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let r=0,o=this.holes.length;r<o;r++)t[r]=this.holes[r].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,r=e.holes.length;t<r;t++){const o=e.holes[t];this.holes.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,r=this.holes.length;t<r;t++){const o=this.holes[t];e.holes.push(o.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,r=e.holes.length;t<r;t++){const o=e.holes[t];this.holes.push(new x0().fromJSON(o))}return this}}const kT={triangulate:function(i,e,t=2){const r=e&&e.length,o=r?e[0]*t:i.length;let a=jv(i,0,o,t,!0);const c=[];if(!a||a.next===a.prev)return c;let u,f,d,m,g,v,S;if(r&&(a=GT(i,e,a,t)),i.length>80*t){u=d=i[0],f=m=i[1];for(let M=t;M<o;M+=t)g=i[M],v=i[M+1],g<u&&(u=g),v<f&&(f=v),g>d&&(d=g),v>m&&(m=v);S=Math.max(d-u,m-f),S=S!==0?32767/S:0}return Ba(a,c,t,u,f,S,0),c}};function jv(i,e,t,r,o){let a,c;if(o===eA(i,e,t,r)>0)for(a=e;a<t;a+=r)c=y0(a,i[a],i[a+1],c);else for(a=t-r;a>=e;a-=r)c=y0(a,i[a],i[a+1],c);return c&&Wc(c,c.next)&&(Va(c),c=c.next),c}function As(i,e){if(!i)return i;e||(e=i);let t=i,r;do if(r=!1,!t.steiner&&(Wc(t,t.next)||Wt(t.prev,t,t.next)===0)){if(Va(t),t=e=t.prev,t===t.next)break;r=!0}else t=t.next;while(r||t!==e);return e}function Ba(i,e,t,r,o,a,c){if(!i)return;!c&&a&&qT(i,r,o,a);let u=i,f,d;for(;i.prev!==i.next;){if(f=i.prev,d=i.next,a?BT(i,r,o,a):zT(i)){e.push(f.i/t|0),e.push(i.i/t|0),e.push(d.i/t|0),Va(i),i=d.next,u=d.next;continue}if(i=d,i===u){c?c===1?(i=HT(As(i),e,t),Ba(i,e,t,r,o,a,2)):c===2&&VT(i,e,t,r,o,a):Ba(As(i),e,t,r,o,a,1);break}}}function zT(i){const e=i.prev,t=i,r=i.next;if(Wt(e,t,r)>=0)return!1;const o=e.x,a=t.x,c=r.x,u=e.y,f=t.y,d=r.y,m=o<a?o<c?o:c:a<c?a:c,g=u<f?u<d?u:d:f<d?f:d,v=o>a?o>c?o:c:a>c?a:c,S=u>f?u>d?u:d:f>d?f:d;let M=r.next;for(;M!==e;){if(M.x>=m&&M.x<=v&&M.y>=g&&M.y<=S&&yo(o,u,a,f,c,d,M.x,M.y)&&Wt(M.prev,M,M.next)>=0)return!1;M=M.next}return!0}function BT(i,e,t,r){const o=i.prev,a=i,c=i.next;if(Wt(o,a,c)>=0)return!1;const u=o.x,f=a.x,d=c.x,m=o.y,g=a.y,v=c.y,S=u<f?u<d?u:d:f<d?f:d,M=m<g?m<v?m:v:g<v?g:v,w=u>f?u>d?u:d:f>d?f:d,y=m>g?m>v?m:v:g>v?g:v,_=ud(S,M,e,t,r),L=ud(w,y,e,t,r);let P=i.prevZ,T=i.nextZ;for(;P&&P.z>=_&&T&&T.z<=L;){if(P.x>=S&&P.x<=w&&P.y>=M&&P.y<=y&&P!==o&&P!==c&&yo(u,m,f,g,d,v,P.x,P.y)&&Wt(P.prev,P,P.next)>=0||(P=P.prevZ,T.x>=S&&T.x<=w&&T.y>=M&&T.y<=y&&T!==o&&T!==c&&yo(u,m,f,g,d,v,T.x,T.y)&&Wt(T.prev,T,T.next)>=0))return!1;T=T.nextZ}for(;P&&P.z>=_;){if(P.x>=S&&P.x<=w&&P.y>=M&&P.y<=y&&P!==o&&P!==c&&yo(u,m,f,g,d,v,P.x,P.y)&&Wt(P.prev,P,P.next)>=0)return!1;P=P.prevZ}for(;T&&T.z<=L;){if(T.x>=S&&T.x<=w&&T.y>=M&&T.y<=y&&T!==o&&T!==c&&yo(u,m,f,g,d,v,T.x,T.y)&&Wt(T.prev,T,T.next)>=0)return!1;T=T.nextZ}return!0}function HT(i,e,t){let r=i;do{const o=r.prev,a=r.next.next;!Wc(o,a)&&Yv(o,r,r.next,a)&&Ha(o,a)&&Ha(a,o)&&(e.push(o.i/t|0),e.push(r.i/t|0),e.push(a.i/t|0),Va(r),Va(r.next),r=i=a),r=r.next}while(r!==i);return As(r)}function VT(i,e,t,r,o,a){let c=i;do{let u=c.next.next;for(;u!==c.prev;){if(c.i!==u.i&&ZT(c,u)){let f=qv(c,u);c=As(c,c.next),f=As(f,f.next),Ba(c,e,t,r,o,a,0),Ba(f,e,t,r,o,a,0);return}u=u.next}c=c.next}while(c!==i)}function GT(i,e,t,r){const o=[];let a,c,u,f,d;for(a=0,c=e.length;a<c;a++)u=e[a]*r,f=a<c-1?e[a+1]*r:i.length,d=jv(i,u,f,r,!1),d===d.next&&(d.steiner=!0),o.push($T(d));for(o.sort(WT),a=0;a<o.length;a++)t=XT(o[a],t);return t}function WT(i,e){return i.x-e.x}function XT(i,e){const t=jT(i,e);if(!t)return e;const r=qv(t,i);return As(r,r.next),As(t,t.next)}function jT(i,e){let t=e,r=-1/0,o;const a=i.x,c=i.y;do{if(c<=t.y&&c>=t.next.y&&t.next.y!==t.y){const v=t.x+(c-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(v<=a&&v>r&&(r=v,o=t.x<t.next.x?t:t.next,v===a))return o}t=t.next}while(t!==e);if(!o)return null;const u=o,f=o.x,d=o.y;let m=1/0,g;t=o;do a>=t.x&&t.x>=f&&a!==t.x&&yo(c<d?a:r,c,f,d,c<d?r:a,c,t.x,t.y)&&(g=Math.abs(c-t.y)/(a-t.x),Ha(t,i)&&(g<m||g===m&&(t.x>o.x||t.x===o.x&&YT(o,t)))&&(o=t,m=g)),t=t.next;while(t!==u);return o}function YT(i,e){return Wt(i.prev,i,e.prev)<0&&Wt(e.next,i,i.next)<0}function qT(i,e,t,r){let o=i;do o.z===0&&(o.z=ud(o.x,o.y,e,t,r)),o.prevZ=o.prev,o.nextZ=o.next,o=o.next;while(o!==i);o.prevZ.nextZ=null,o.prevZ=null,KT(o)}function KT(i){let e,t,r,o,a,c,u,f,d=1;do{for(t=i,i=null,a=null,c=0;t;){for(c++,r=t,u=0,e=0;e<d&&(u++,r=r.nextZ,!!r);e++);for(f=d;u>0||f>0&&r;)u!==0&&(f===0||!r||t.z<=r.z)?(o=t,t=t.nextZ,u--):(o=r,r=r.nextZ,f--),a?a.nextZ=o:i=o,o.prevZ=a,a=o;t=r}a.nextZ=null,d*=2}while(c>1);return i}function ud(i,e,t,r,o){return i=(i-t)*o|0,e=(e-r)*o|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function $T(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function yo(i,e,t,r,o,a,c,u){return(o-c)*(e-u)>=(i-c)*(a-u)&&(i-c)*(r-u)>=(t-c)*(e-u)&&(t-c)*(a-u)>=(o-c)*(r-u)}function ZT(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!QT(i,e)&&(Ha(i,e)&&Ha(e,i)&&JT(i,e)&&(Wt(i.prev,i,e.prev)||Wt(i,e.prev,e))||Wc(i,e)&&Wt(i.prev,i,i.next)>0&&Wt(e.prev,e,e.next)>0)}function Wt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Wc(i,e){return i.x===e.x&&i.y===e.y}function Yv(i,e,t,r){const o=Ec(Wt(i,e,t)),a=Ec(Wt(i,e,r)),c=Ec(Wt(t,r,i)),u=Ec(Wt(t,r,e));return!!(o!==a&&c!==u||o===0&&wc(i,t,e)||a===0&&wc(i,r,e)||c===0&&wc(t,i,r)||u===0&&wc(t,e,r))}function wc(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ec(i){return i>0?1:i<0?-1:0}function QT(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Yv(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Ha(i,e){return Wt(i.prev,i,i.next)<0?Wt(i,e,i.next)>=0&&Wt(i,i.prev,e)>=0:Wt(i,e,i.prev)<0||Wt(i,i.next,e)<0}function JT(i,e){let t=i,r=!1;const o=(i.x+e.x)/2,a=(i.y+e.y)/2;do t.y>a!=t.next.y>a&&t.next.y!==t.y&&o<(t.next.x-t.x)*(a-t.y)/(t.next.y-t.y)+t.x&&(r=!r),t=t.next;while(t!==i);return r}function qv(i,e){const t=new hd(i.i,i.x,i.y),r=new hd(e.i,e.x,e.y),o=i.next,a=e.prev;return i.next=e,e.prev=i,t.next=o,o.prev=t,r.next=t,t.prev=r,a.next=r,r.prev=a,r}function y0(i,e,t,r){const o=new hd(i,e,t);return r?(o.next=r.next,o.prev=r,r.next.prev=o,r.next=o):(o.prev=o,o.next=o),o}function Va(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function hd(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function eA(i,e,t,r){let o=0;for(let a=e,c=t-r;a<t;a+=r)o+=(i[c]-i[a])*(i[a+1]+i[c+1]),c=a;return o}class Na{static area(e){const t=e.length;let r=0;for(let o=t-1,a=0;a<t;o=a++)r+=e[o].x*e[a].y-e[a].x*e[o].y;return r*.5}static isClockWise(e){return Na.area(e)<0}static triangulateShape(e,t){const r=[],o=[],a=[];S0(e),M0(r,e);let c=e.length;t.forEach(S0);for(let f=0;f<t.length;f++)o.push(c),c+=t[f].length,M0(r,t[f]);const u=kT.triangulate(r,o);for(let f=0;f<u.length;f+=3)a.push(u.slice(f,f+3));return a}}function S0(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function M0(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Nd extends _i{constructor(e=new Xv([new ze(.5,.5),new ze(-.5,.5),new ze(-.5,-.5),new ze(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const r=this,o=[],a=[];for(let u=0,f=e.length;u<f;u++){const d=e[u];c(d)}this.setAttribute("position",new zn(o,3)),this.setAttribute("uv",new zn(a,2)),this.computeVertexNormals();function c(u){const f=[],d=t.curveSegments!==void 0?t.curveSegments:12,m=t.steps!==void 0?t.steps:1,g=t.depth!==void 0?t.depth:1;let v=t.bevelEnabled!==void 0?t.bevelEnabled:!0,S=t.bevelThickness!==void 0?t.bevelThickness:.2,M=t.bevelSize!==void 0?t.bevelSize:S-.1,w=t.bevelOffset!==void 0?t.bevelOffset:0,y=t.bevelSegments!==void 0?t.bevelSegments:3;const _=t.extrudePath,L=t.UVGenerator!==void 0?t.UVGenerator:tA;let P,T=!1,V,I,N,z;_&&(P=_.getSpacedPoints(m),T=!0,v=!1,V=_.computeFrenetFrames(m,!1),I=new B,N=new B,z=new B),v||(y=0,S=0,M=0,w=0);const R=u.extractPoints(d);let A=R.shape;const F=R.holes;if(!Na.isClockWise(A)){A=A.reverse();for(let _e=0,Re=F.length;_e<Re;_e++){const O=F[_e];Na.isClockWise(O)&&(F[_e]=O.reverse())}}const Y=Na.triangulateShape(A,F),ie=A;for(let _e=0,Re=F.length;_e<Re;_e++){const O=F[_e];A=A.concat(O)}function ce(_e,Re,O){return Re||console.error("THREE.ExtrudeGeometry: vec does not exist"),_e.clone().addScaledVector(Re,O)}const oe=A.length,ue=Y.length;function G(_e,Re,O){let Qe,Ee,Ve;const Le=_e.x-Re.x,it=_e.y-Re.y,Oe=O.x-_e.x,D=O.y-_e.y,C=Le*Le+it*it,Z=Le*D-it*Oe;if(Math.abs(Z)>Number.EPSILON){const de=Math.sqrt(C),xe=Math.sqrt(Oe*Oe+D*D),pe=Re.x-it/de,qe=Re.y+Le/de,De=O.x-D/xe,Ge=O.y+Oe/xe,pt=((De-pe)*D-(Ge-qe)*Oe)/(Le*D-it*Oe);Qe=pe+Le*pt-_e.x,Ee=qe+it*pt-_e.y;const Te=Qe*Qe+Ee*Ee;if(Te<=2)return new ze(Qe,Ee);Ve=Math.sqrt(Te/2)}else{let de=!1;Le>Number.EPSILON?Oe>Number.EPSILON&&(de=!0):Le<-Number.EPSILON?Oe<-Number.EPSILON&&(de=!0):Math.sign(it)===Math.sign(D)&&(de=!0),de?(Qe=-it,Ee=Le,Ve=Math.sqrt(C)):(Qe=Le,Ee=it,Ve=Math.sqrt(C/2))}return new ze(Qe/Ve,Ee/Ve)}const he=[];for(let _e=0,Re=ie.length,O=Re-1,Qe=_e+1;_e<Re;_e++,O++,Qe++)O===Re&&(O=0),Qe===Re&&(Qe=0),he[_e]=G(ie[_e],ie[O],ie[Qe]);const ae=[];let k,ee=he.concat();for(let _e=0,Re=F.length;_e<Re;_e++){const O=F[_e];k=[];for(let Qe=0,Ee=O.length,Ve=Ee-1,Le=Qe+1;Qe<Ee;Qe++,Ve++,Le++)Ve===Ee&&(Ve=0),Le===Ee&&(Le=0),k[Qe]=G(O[Qe],O[Ve],O[Le]);ae.push(k),ee=ee.concat(k)}for(let _e=0;_e<y;_e++){const Re=_e/y,O=S*Math.cos(Re*Math.PI/2),Qe=M*Math.sin(Re*Math.PI/2)+w;for(let Ee=0,Ve=ie.length;Ee<Ve;Ee++){const Le=ce(ie[Ee],he[Ee],Qe);ve(Le.x,Le.y,-O)}for(let Ee=0,Ve=F.length;Ee<Ve;Ee++){const Le=F[Ee];k=ae[Ee];for(let it=0,Oe=Le.length;it<Oe;it++){const D=ce(Le[it],k[it],Qe);ve(D.x,D.y,-O)}}}const Fe=M+w;for(let _e=0;_e<oe;_e++){const Re=v?ce(A[_e],ee[_e],Fe):A[_e];T?(N.copy(V.normals[0]).multiplyScalar(Re.x),I.copy(V.binormals[0]).multiplyScalar(Re.y),z.copy(P[0]).add(N).add(I),ve(z.x,z.y,z.z)):ve(Re.x,Re.y,0)}for(let _e=1;_e<=m;_e++)for(let Re=0;Re<oe;Re++){const O=v?ce(A[Re],ee[Re],Fe):A[Re];T?(N.copy(V.normals[_e]).multiplyScalar(O.x),I.copy(V.binormals[_e]).multiplyScalar(O.y),z.copy(P[_e]).add(N).add(I),ve(z.x,z.y,z.z)):ve(O.x,O.y,g/m*_e)}for(let _e=y-1;_e>=0;_e--){const Re=_e/y,O=S*Math.cos(Re*Math.PI/2),Qe=M*Math.sin(Re*Math.PI/2)+w;for(let Ee=0,Ve=ie.length;Ee<Ve;Ee++){const Le=ce(ie[Ee],he[Ee],Qe);ve(Le.x,Le.y,g+O)}for(let Ee=0,Ve=F.length;Ee<Ve;Ee++){const Le=F[Ee];k=ae[Ee];for(let it=0,Oe=Le.length;it<Oe;it++){const D=ce(Le[it],k[it],Qe);T?ve(D.x,D.y+P[m-1].y,P[m-1].x+O):ve(D.x,D.y,g+O)}}}J(),fe();function J(){const _e=o.length/3;if(v){let Re=0,O=oe*Re;for(let Qe=0;Qe<ue;Qe++){const Ee=Y[Qe];Ae(Ee[2]+O,Ee[1]+O,Ee[0]+O)}Re=m+y*2,O=oe*Re;for(let Qe=0;Qe<ue;Qe++){const Ee=Y[Qe];Ae(Ee[0]+O,Ee[1]+O,Ee[2]+O)}}else{for(let Re=0;Re<ue;Re++){const O=Y[Re];Ae(O[2],O[1],O[0])}for(let Re=0;Re<ue;Re++){const O=Y[Re];Ae(O[0]+oe*m,O[1]+oe*m,O[2]+oe*m)}}r.addGroup(_e,o.length/3-_e,0)}function fe(){const _e=o.length/3;let Re=0;we(ie,Re),Re+=ie.length;for(let O=0,Qe=F.length;O<Qe;O++){const Ee=F[O];we(Ee,Re),Re+=Ee.length}r.addGroup(_e,o.length/3-_e,1)}function we(_e,Re){let O=_e.length;for(;--O>=0;){const Qe=O;let Ee=O-1;Ee<0&&(Ee=_e.length-1);for(let Ve=0,Le=m+y*2;Ve<Le;Ve++){const it=oe*Ve,Oe=oe*(Ve+1),D=Re+Qe+it,C=Re+Ee+it,Z=Re+Ee+Oe,de=Re+Qe+Oe;Be(D,C,Z,de)}}}function ve(_e,Re,O){f.push(_e),f.push(Re),f.push(O)}function Ae(_e,Re,O){Ze(_e),Ze(Re),Ze(O);const Qe=o.length/3,Ee=L.generateTopUV(r,o,Qe-3,Qe-2,Qe-1);_t(Ee[0]),_t(Ee[1]),_t(Ee[2])}function Be(_e,Re,O,Qe){Ze(_e),Ze(Re),Ze(Qe),Ze(Re),Ze(O),Ze(Qe);const Ee=o.length/3,Ve=L.generateSideWallUV(r,o,Ee-6,Ee-3,Ee-2,Ee-1);_t(Ve[0]),_t(Ve[1]),_t(Ve[3]),_t(Ve[1]),_t(Ve[2]),_t(Ve[3])}function Ze(_e){o.push(f[_e*3+0]),o.push(f[_e*3+1]),o.push(f[_e*3+2])}function _t(_e){a.push(_e.x),a.push(_e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,r=this.parameters.options;return nA(t,r,e)}static fromJSON(e,t){const r=[];for(let a=0,c=e.shapes.length;a<c;a++){const u=t[e.shapes[a]];r.push(u)}const o=e.options.extrudePath;return o!==void 0&&(e.options.extrudePath=new cd[o.type]().fromJSON(o)),new Nd(r,e.options)}}const tA={generateTopUV:function(i,e,t,r,o){const a=e[t*3],c=e[t*3+1],u=e[r*3],f=e[r*3+1],d=e[o*3],m=e[o*3+1];return[new ze(a,c),new ze(u,f),new ze(d,m)]},generateSideWallUV:function(i,e,t,r,o,a){const c=e[t*3],u=e[t*3+1],f=e[t*3+2],d=e[r*3],m=e[r*3+1],g=e[r*3+2],v=e[o*3],S=e[o*3+1],M=e[o*3+2],w=e[a*3],y=e[a*3+1],_=e[a*3+2];return Math.abs(u-m)<Math.abs(c-d)?[new ze(c,1-f),new ze(d,1-g),new ze(v,1-M),new ze(w,1-_)]:[new ze(u,1-f),new ze(m,1-g),new ze(S,1-M),new ze(y,1-_)]}};function nA(i,e,t){if(t.shapes=[],Array.isArray(i))for(let r=0,o=i.length;r<o;r++){const a=i[r];t.shapes.push(a.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Xa extends _i{constructor(e=1,t=32,r=16,o=0,a=Math.PI*2,c=0,u=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:r,phiStart:o,phiLength:a,thetaStart:c,thetaLength:u},t=Math.max(3,Math.floor(t)),r=Math.max(2,Math.floor(r));const f=Math.min(c+u,Math.PI);let d=0;const m=[],g=new B,v=new B,S=[],M=[],w=[],y=[];for(let _=0;_<=r;_++){const L=[],P=_/r;let T=0;_===0&&c===0?T=.5/t:_===r&&f===Math.PI&&(T=-.5/t);for(let V=0;V<=t;V++){const I=V/t;g.x=-e*Math.cos(o+I*a)*Math.sin(c+P*u),g.y=e*Math.cos(c+P*u),g.z=e*Math.sin(o+I*a)*Math.sin(c+P*u),M.push(g.x,g.y,g.z),v.copy(g).normalize(),w.push(v.x,v.y,v.z),y.push(I+T,1-P),L.push(d++)}m.push(L)}for(let _=0;_<r;_++)for(let L=0;L<t;L++){const P=m[_][L+1],T=m[_][L],V=m[_+1][L],I=m[_+1][L+1];(_!==0||c>0)&&S.push(P,T,I),(_!==r-1||f<Math.PI)&&S.push(T,V,I)}this.setIndex(S),this.setAttribute("position",new zn(M,3)),this.setAttribute("normal",new zn(w,3)),this.setAttribute("uv",new zn(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xa(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class hn extends ko{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new ht(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ht(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yv,this.normalScale=new ze(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ud extends fn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ht(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class iA extends Ud{constructor(e,t,r){super(e,r),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(fn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ht(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const af=new It,w0=new B,E0=new B;class rA{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ze(512,512),this.map=null,this.mapPass=null,this.matrix=new It,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Rd,this._frameExtents=new ze(1,1),this._viewportCount=1,this._viewports=[new jt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,r=this.matrix;w0.setFromMatrixPosition(e.matrixWorld),t.position.copy(w0),E0.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(E0),t.updateMatrixWorld(),af.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(af),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(af)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class sA extends rA{constructor(){super(new Nv(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class oA extends Ud{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(fn.DEFAULT_UP),this.updateMatrix(),this.target=new fn,this.shadow=new sA}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class aA extends Ud{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:xd}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=xd);function Tc(i,e,t){let r=i*374761393+e*668265263+t*1013904223|0;return r=Math.imul(r^r>>>13,1274126177),r=r^r>>>16,(r>>>0)/4294967295}function T0(i){return i*i*(3-2*i)}function Kv(i,e,t){const r=Math.floor(i),o=Math.floor(e),a=T0(i-r),c=T0(e-o),u=Tc(r,o,t),f=Tc(r+1,o,t),d=Tc(r,o+1,t),m=Tc(r+1,o+1,t),g=u+(f-u)*a,v=d+(m-d)*a;return g+(v-g)*c}function Gi(i,e,t,r=4){let o=.5,a=1,c=0,u=0;for(let f=0;f<r;f++)c+=o*Kv(i*a,e*a,t+f*131),u+=o,o*=.5,a*=2.03;return c/u}function A0(i,e,t,r=4){let o=.5,a=1,c=0,u=0;for(let f=0;f<r;f++){const d=Kv(i*a,e*a,t+f*733),m=1-Math.abs(2*d-1);c+=o*m*m,u+=o,o*=.5,a*=2.11}return c/u}function rn(i,e,t){return i<e?e:i>t?t:i}function Fn(i,e,t){const r=rn((t-i)/(e-i),0,1);return r*r*(3-2*r)}const zc=12e3,C0={y:0};function Yr(i,e,t,r){return{name:i,x:e,z:t,headingDeg:r,deckY:19,deckLength:300,deckWidth:77,landingLength:240,landingAngleDeg:9.5,wireCount:4,wireSpacing:12.5,catapultOffsetX:-14,catapultLength:94}}const Qt={startAlong:-115,startAcross:5,halfWidth:15,wireFirstS:35,catchSMin:26,catchSMax:170},Io={id:"archipelago",label:"Procedural islands",attribution:null,airfield:{centerX:-1800,centerZ:2400,elevation:140,runwayLength:2200,runwayWidth:48,headingDeg:90},carriers:[Yr("ALPHA",6200,-1400,135),Yr("BRAVO",9500,9500,85),Yr("CHARLIE",-9500,9500,125),Yr("DELTA",-9500,-9500,275)]},fd={id:"kauai",label:"Kauai, Hawaii — live terrain",attribution:"Terrain & imagery © Mapbox © OpenStreetMap",airfield:{centerX:1500,centerZ:2250,elevation:57,runwayLength:2200,runwayWidth:48,headingDeg:90},carriers:[Yr("LEHUA",-10500,5500,90),Yr("MAKANI",-500,10250,50),Yr("NALU",10500,10500,0),Yr("KAI",10500,2250,40)]};let ji=Io,Fd=t_;function lA(i,e){ji=i,Fd=e}function R0(){ji=Io,Fd=t_}function lf(){return ji}function Xc(){return ji.airfield}function No(){return ji.carriers}function dd(i,e){return Fd(i,e)}function cA(i,e){const t=ji.airfield,r=Math.abs(i-t.centerX),o=Math.abs(e-t.centerZ);return r<=t.runwayLength/2+60&&o<=t.runwayWidth/2+60}function $v(i){const e=i*Math.PI/180,t=[Math.sin(e),-Math.cos(e)],r=[Math.cos(e),Math.sin(e)];return{fwd:t,right:r}}function Zv(i,e,t){const{fwd:r,right:o}=$v(i.headingDeg),a=e-i.x,c=t-i.z;return[a*r[0]+c*r[1],a*o[0]+c*o[1]]}function uA(i,e,t){const[r,o]=Zv(i,e,t);return Math.abs(r)<=i.deckLength/2&&Math.abs(o)<=i.deckWidth/2}function Qv(i,e){for(const t of ji.carriers)if(uA(t,i,e))return t;return null}function Jv(i,e){let t=ji.carriers[0],r=1/0;for(const o of ji.carriers){const a=Math.hypot(i-o.x,e-o.z);a<r&&(r=a,t=o)}return t}function Ga(i,e){const t=Qv(i,e);if(t)return{y:t.deckY,kind:"deck"};const r=dd(i,e),o=ji.airfield;return cA(i,e)&&r>o.elevation-30?{y:o.elevation,kind:"runway"}:r<C0.y?{y:C0.y,kind:"water"}:{y:r,kind:"terrain"}}function e_(i,e,t,r,o){const a=Math.abs(i-r.centerX),c=Math.abs(e-r.centerZ),u=r.runwayLength/2+100,f=r.runwayWidth/2+100,d=Math.hypot(Math.max(a-u,0),Math.max(c-f,0)),m=1-Fn(0,400,d);t=t+(r.elevation-t)*m;for(const g of o){const v=Math.hypot(i-g.x,e-g.z),S=1-Fn(700,1600,v);if(S>0){const M=Math.min(t,-40);t=t*(1-S)+M*S}}return t}function hA(i){const e=fd.airfield,t=fd.carriers;return(r,o)=>{if(Math.abs(r)>zc+500||Math.abs(o)>zc+500)return-40;let a=i.sample(r,o);return a<.5&&(a=-40),e_(r,o,a,e,t)}}const fA=[{x:Io.airfield.centerX,z:Io.airfield.centerZ,r:4300,falloff:3400,ridgeAmp:820,hillAmp:200,seed:17},{x:2500,z:6200,r:2400,falloff:2800,ridgeAmp:1750,hillAmp:260,seed:41,coastSharp:.55},{x:-5800,z:-2600,r:2500,falloff:2600,ridgeAmp:1300,hillAmp:240,seed:73,coastSharp:.7},{x:-1500,z:-5600,r:1700,falloff:2600,ridgeAmp:120,hillAmp:60,base:14,seed:101},{x:5600,z:3600,r:1100,falloff:1700,ridgeAmp:620,hillAmp:150,seed:131},{x:6600,z:5300,r:750,falloff:1150,ridgeAmp:420,hillAmp:110,seed:149}],dA=[{x:3e3,z:6600,h:1500,r:1100},{x:1800,z:5500,h:950,r:850},{x:-6100,z:-1700,h:1150,r:950},{x:-5200,z:-3200,h:800,r:750},{x:-700,z:-900,h:850,r:950},{x:-4300,z:4500,h:720,r:800}],P0=70;function t_(i,e){const r=Io.airfield,o=Gi(i*8e-5,e*8e-5,1340,3)-.5,a=Gi(i*8e-5,e*8e-5,1346,3)-.5,c=i+o*3600,u=e+a*3600,f=(Gi(i*22e-5,e*22e-5,1408,4)-.5)*2600;let d=0,m=0,g=0,v=0,S=P0;for(const R of fA){const A=Math.hypot(i-R.x,e-R.z),F=R.r+R.falloff*(R.coastSharp??1),$=1-Fn(R.r,F,A+f);$>d&&(d=$,g=R.ridgeAmp,v=R.hillAmp,S=R.base??P0),m=Math.max(m,1-Fn(R.r,F+2600,A))}const M=Fn(.34,.72,Gi(c*11e-5,u*11e-5,1342,3)),w=A0(c*3e-4,u*3e-4,1337,5),y=Gi(c*7e-4,u*7e-4,1346,5),_=Gi(i*.004,e*.004,1360,3);let L=0;for(const R of dA){const A=Math.hypot(i-R.x,e-R.z);if(A<R.r*1.8){const F=1-Fn(R.r*.3,R.r*1.5,A);L=Math.max(L,R.h*F*F)}}const P=Math.pow(w,1.5)*g*(.35+.65*M)+y*v+_*16+L,T=Math.hypot(i-r.centerX,e-r.centerZ),V=.32+.68*Fn(1400,3600,T),I=(S+P*V)*d,N=(-14-A0(i*22e-5,e*22e-5,1377,3)*130)*(1-.5*m),z=I+N*(1-d);return e_(i,e,z,r,Io.carriers)}const b0={pitchUp:"Pitch up (nose up)",pitchDown:"Pitch down (nose down)",rollLeft:"Roll left",rollRight:"Roll right",yawLeft:"Yaw left (rudder)",yawRight:"Yaw right (rudder)",throttleUp:"Throttle up",throttleDown:"Throttle down",brake:"Wheel brakes",gear:"Landing gear",flaps:"Flaps",speedbrake:"Speed brake",ab:"Afterburner (toggle)",cat:"Catapult (hold)",camera:"Cycle camera",pause:"Pause",trimUp:"Trim nose up",trimDown:"Trim nose down",fire:"Fire guns (dogfight)"},n_={pitchUp:"ArrowUp",pitchDown:"ArrowDown",rollLeft:"ArrowLeft",rollRight:"ArrowRight",yawLeft:"KeyA",yawRight:"KeyD",throttleUp:"KeyW",throttleDown:"KeyS",brake:"KeyB",gear:"KeyG",flaps:"KeyF",speedbrake:"KeyX",ab:"ShiftLeft",cat:"Space",camera:"KeyC",pause:"Escape",trimUp:"KeyT",trimDown:"KeyV",fire:"KeyQ"},L0={live:"Real time (Hawaii)",fixed:"Fixed time of day",cycle:"Fast cycle"},D0={cruise:"Cruise — free flight",dogfight:"Dogfight — AI bandits"},pA=4,mA={low:144,medium:216,high:320},i_="f14sim.settings.v1";function cf(){return{volume:.7,sensitivity:1,quality:"medium",world:"archipelago",gameMode:"cruise",daylight:"live",timeOfDay:9,minimap:!0,bindings:{...n_}}}function gA(){try{const i=localStorage.getItem(i_);if(!i)return cf();const e=JSON.parse(i),t=cf();return{volume:typeof e.volume=="number"?uf(e.volume,0,1):t.volume,sensitivity:typeof e.sensitivity=="number"?uf(e.sensitivity,.4,1.5):t.sensitivity,quality:e.quality==="low"||e.quality==="medium"||e.quality==="high"?e.quality:t.quality,world:e.world==="archipelago"||e.world==="kauai"?e.world:t.world,gameMode:e.gameMode==="dogfight"||e.gameMode==="cruise"?e.gameMode:t.gameMode,daylight:e.daylight==="live"||e.daylight==="fixed"||e.daylight==="cycle"?e.daylight:t.daylight,timeOfDay:typeof e.timeOfDay=="number"?uf(e.timeOfDay,0,24):t.timeOfDay,minimap:typeof e.minimap=="boolean"?e.minimap:t.minimap,bindings:{...t.bindings,...e.bindings??{}}}}catch{return cf()}}function I0(i){try{localStorage.setItem(i_,JSON.stringify(i))}catch{}}function uf(i,e,t){return i<e?e:i>t?t:i}function vA(i){return i.startsWith("Arrow")?{Up:"↑",Down:"↓",Left:"←",Right:"→"}[i.slice(5)]??i:i.startsWith("Key")?i.slice(3):i.startsWith("Digit")?i.slice(5):i==="ShiftLeft"?"L Shift":i==="ShiftRight"?"R Shift":i==="Space"?"Space":i==="Escape"?"Esc":i==="Minus"?"-":i==="Equal"?"=":i}const hf=zc;function Tt(i,e,t){return i+(e-i)*t}function _A(i,e,t,r,o){if(i<-1){const w=pr.clamp((i+90)/90,0,1);o.setRGB(Tt(.05,.27,w),Tt(.13,.46,w),Tt(.19,.5,w),gn);return}const a=Gi(t*.0016,r*.0016,4242,3),c=(Gi(t*.02,r*.02,808,2)-.5)*.06;let u=Tt(.44,.29,a),f=Tt(.48,.4,a),d=Tt(.28,.21,a);u+=c,f+=c,d+=c;const m=1-Fn(9,42,i);u=Tt(u,.83,m),f=Tt(f,.77,m),d=Tt(d,.57,m);const g=Fn(.5,.95,e);u=Tt(u,.38,g),f=Tt(f,.36,g),d=Tt(d,.33,g);const v=Fn(560,820,i)*(1-.5*g);u=Tt(u,.47,v),f=Tt(f,.45,v),d=Tt(d,.43,v);const S=760+a*280,M=Fn(S,S+170,i)*(1-Fn(.8,1.15,e));u=Tt(u,.93,M),f=Tt(f,.95,M),d=Tt(d,.97,M),o.setRGB(u,f,d,gn)}function xA(i,e,t,r,o){if(i<-1){const S=pr.clamp((i+90)/90,0,1);o.setRGB(Tt(.05,.27,S),Tt(.13,.46,S),Tt(.19,.5,S),gn);return}const a=Gi(t*.0011,r*.0011,991,3),c=(Gi(t*.02,r*.02,553,2)-.5)*.06;let u=Tt(.24,.34,a)+c,f=Tt(.42,.38,a)+c,d=Tt(.2,.24,a)+c;const m=1-Fn(3,30,i);u=Tt(u,.82,m),f=Tt(f,.76,m),d=Tt(d,.57,m);const g=Fn(.55,1.05,e);u=Tt(u,.36,g),f=Tt(f,.34,g),d=Tt(d,.31,g);const v=Fn(700,1100,i)*(1-.6*g)*.5;u=Tt(u,.42,v),f=Tt(f,.4,v),d=Tt(d,.38,v),o.setRGB(u,f,d,gn)}const yA={island:_A,tropical:xA};function SA(i,e){const t=mA[i],r=new zo(hf*2,hf*2,t,t);r.rotateX(-Math.PI/2);const o=r.attributes.position,a=t+1,c=hf*2/t,u=new Float32Array(o.count);for(let m=0;m<o.count;m++){const g=e.height(o.getX(m),o.getZ(m));o.setY(m,g),u[m]=g}let f;if(e.texture){const{canvas:m,worldX0:g,worldZ0:v,worldW:S,worldH:M}=e.texture,w=r.attributes.uv;for(let _=0;_<o.count;_++)w.setXY(_,(o.getX(_)-g)/S,(o.getZ(_)-v)/M);w.needsUpdate=!0;const y=new Gc(m);y.flipY=!1,y.colorSpace=gn,y.anisotropy=8,f=new hn({map:y,roughness:1,metalness:0})}else{const m=yA[e.style],g=new Float32Array(o.count*3),v=new ht;for(let S=0;S<o.count;S++){const M=S%a,w=S/a|0,y=M>0?S-1:S,_=M<a-1?S+1:S,L=w>0?S-a:S,P=w<a-1?S+a:S,T=(u[_]-u[y])/(Math.abs(_-y)*c),V=(u[P]-u[L])/(Math.abs(P-L)*c);m(u[S],Math.hypot(T,V),o.getX(S),o.getZ(S),v),g[S*3]=v.r,g[S*3+1]=v.g,g[S*3+2]=v.b}r.setAttribute("color",new ri(g,3)),f=new hn({vertexColors:!0,roughness:1,metalness:0})}r.computeVertexNormals();const d=new Pt(r,f);return d.receiveShadow=i!=="low",d}function MA(){const e=document.createElement("canvas");e.width=256,e.height=256;const t=e.getContext("2d"),r=t.createImageData(256,256),o=[[2,1,.6,1],[1,2,2.2,.9],[3,2,4.1,.6],[2,3,1.4,.55],[5,3,3.3,.4],[3,5,5,.38],[7,4,.9,.26],[4,7,2.7,.24]],a=o.reduce((u,f)=>u+f[3],0);for(let u=0;u<256;u++)for(let f=0;f<256;f++){let d=0;for(const[v,S,M,w]of o)d+=w*Math.sin(2*Math.PI*(v*f/256+S*u/256)+M);d/=a;const m=Math.round(255*(.62+.38*Math.tanh(d*1.7))),g=(u*256+f)*4;r.data[g]=m,r.data[g+1]=m,r.data[g+2]=m,r.data[g+3]=255}t.putImageData(r,0,0);const c=new Gc(e);return c.wrapS=Oa,c.wrapT=Oa,c.repeat.set(96,96),c.anisotropy=4,c}function wA(){const i=new zo(6e4,6e4,1,1);i.rotateX(-Math.PI/2);const e=MA(),t=new hn({color:1459294,roughness:.5,metalness:.4,transparent:!0,opacity:.9,bumpMap:e,bumpScale:1.6,roughnessMap:e}),r=new Pt(i,t);return r.position.y=0,r}function EA(){const i=new Xa(42e3,32,20),e={uZenith:{value:new ht(4029112)},uHorizon:{value:new ht(13161692)},uSunDir:{value:new B(0,1,0)},uSunTint:{value:new ht(16777215)},uGlow:{value:.35}},t=new vr({uniforms:e,side:On,depthWrite:!1,fog:!1,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uSunDir;
      uniform vec3 uSunTint;
      uniform float uGlow;
      varying vec3 vDir;
      void main() {
        vec3 dir = normalize(vDir);
        // vertical gradient: horizon colour up to zenith colour
        float t = clamp(dir.y, 0.0, 1.0);
        vec3 col = mix(uHorizon, uZenith, pow(t, 0.55));
        // sun glow, warm and tight near the disc, wide and soft at dusk
        float d = max(dot(dir, normalize(uSunDir)), 0.0);
        col += uSunTint * uGlow * pow(d, 6.0);
        col += uSunTint * uGlow * 0.35 * pow(d, 1.6);
        // below the horizon darken toward a flat sea haze
        col = mix(col * 0.55, col, smoothstep(-0.08, 0.02, dir.y));
        gl_FragColor = vec4(col, 1.0);
      }
    `}),r=new Pt(i,t);r.frustumCulled=!1;const o=900,a=new Float32Array(o*3);for(let f=0;f<o;f++){const d=1-f/o*1.6,m=Math.sqrt(Math.max(0,1-d*d)),g=f*2.39996,v=4e4;a[f*3]=Math.cos(g)*m*v,a[f*3+1]=d*v,a[f*3+2]=Math.sin(g)*m*v}const c=new _i;c.setAttribute("position",new ri(a,3));const u=new ET(c,new Bv({color:14674431,size:90,sizeAttenuation:!0,fog:!1,transparent:!0,opacity:0}));return u.frustumCulled=!1,{mesh:r,stars:u,set(f,d,m,g,v){e.uSunDir.value.copy(f),e.uSunTint.value.copy(d),e.uZenith.value.copy(m),e.uHorizon.value.copy(g),e.uGlow.value=v},setStarsVisible(f){u.material.opacity=f?.85:0,u.visible=f},follow(f){r.position.copy(f),u.position.copy(f)}}}function TA(i){const e=document.createElement("canvas");e.width=1024,e.height=768;const t=e.getContext("2d");t.fillStyle="#3d4348",t.fillRect(0,0,1024,768),t.fillStyle="#464d53";for(let w=0;w<2600;w++)t.fillRect(Math.random()*1024,Math.random()*768,3,3);const r=1024/i.deckLength,o=768/i.deckWidth,a=w=>(w+i.deckLength/2)*r,c=w=>(w+i.deckWidth/2)*o,u=i.landingAngleDeg*Math.PI/180,f=Math.cos(u),d=Math.sin(u),m=(w,y)=>a(Qt.startAlong+w*f+y*d),g=(w,y)=>c(Qt.startAcross-w*d+y*f),v=Qt.halfWidth,S=i.landingLength;t.fillStyle="#2a2f34",t.beginPath(),t.moveTo(m(0,-v),g(0,-v)),t.lineTo(m(S,-v),g(S,-v)),t.lineTo(m(S,v),g(S,v)),t.lineTo(m(0,v),g(0,v)),t.closePath(),t.fill(),t.strokeStyle="#e8e8e5",t.lineWidth=3;for(const w of[-v,v])t.beginPath(),t.moveTo(m(0,w),g(0,w)),t.lineTo(m(S,w),g(S,w)),t.stroke();t.lineWidth=4;for(let w=16;w<S-26;w+=34)t.beginPath(),t.moveTo(m(w,0),g(w,0)),t.lineTo(m(w+22,0),g(w+22,0)),t.stroke();t.strokeStyle="#f2f2ef",t.lineWidth=8;for(let w=0;w<i.wireCount;w++){const y=Qt.wireFirstS+w*i.wireSpacing;t.beginPath(),t.moveTo(m(y,-v),g(y,-v)),t.lineTo(m(y,v),g(y,v)),t.stroke()}t.fillStyle="#f2f2ef";for(let w=0;w<3;w++){const y=6+w*7;t.beginPath(),t.moveTo(m(y,-v+3),g(y,-v+3)),t.lineTo(m(y+2.5,-v+3),g(y+2.5,-v+3)),t.lineTo(m(y+2.5,v-3),g(y+2.5,v-3)),t.lineTo(m(y,v-3),g(y,v-3)),t.closePath(),t.fill()}t.strokeStyle="#d8d8d2",t.lineWidth=5,t.beginPath(),t.moveTo(a(-40),c(i.catapultOffsetX)),t.lineTo(a(-40+i.catapultLength),c(i.catapultOffsetX)),t.stroke(),t.lineWidth=3;for(const w of[-40,-40+i.catapultLength])t.beginPath(),t.moveTo(a(w),c(i.catapultOffsetX-6)),t.lineTo(a(w),c(i.catapultOffsetX+6)),t.stroke();t.strokeStyle="#b7beb4",t.lineWidth=3,t.strokeRect(6,6,1012,756);const M=new Gc(e);return M.anisotropy=8,M}function AA(i){const e=new Zt,t=i.deckLength,r=i.deckWidth,o=i.deckY,a=o-1,c=a+14,u=new hn({color:5659488,roughness:.9}),f=t/2+2,d=r/2+1,m=new Xv;m.moveTo(-f,-d),m.lineTo(f-55,-d),m.lineTo(f+26,0),m.lineTo(f-55,d),m.lineTo(-f,d),m.closePath();const g=new Nd(m,{depth:c,bevelEnabled:!1});g.rotateX(Math.PI/2);const v=new Pt(g,u);v.position.y=a,e.add(v);const S=new Pt(new Pn(t,1,r),new hn({map:TA(i),roughness:.95}));S.position.y=o-.5,e.add(S);const M=new Pt(new Pn(28,22,14),new hn({color:9080716,roughness:.9}));M.position.set(0,o+10.5,30),e.add(M);const w=new Pt(new Di(1.2,1.6,16,6),new hn({color:7238518}));w.position.set(0,o+29,30),e.add(w);const y=new Pt(new Di(4.5,4.5,.6,20,1,!0,0,Math.PI),new hn({color:14408661,roughness:.7,side:gi}));y.position.set(0,o+38,30),e.add(y);const _=i.landingAngleDeg*Math.PI/180,L=Math.cos(_),P=Math.sin(_),T=new hn({color:2829099}),V=new Pn(.22,.22,Qt.halfWidth*2);for(let I=0;I<i.wireCount;I++){const N=Qt.wireFirstS+I*i.wireSpacing,z=Qt.startAlong+N*L,R=Qt.startAcross-N*P,A=new Pt(V,T);A.position.set(z,o+.35,R),A.rotation.y=_,e.add(A)}return e.position.set(i.x,0,i.z),e.rotation.y=(90-i.headingDeg)*Math.PI/180,e.traverse(I=>{const N=I;N.isMesh&&(N.castShadow=!0,N.receiveShadow=!0)}),e}function CA(){const i=document.createElement("canvas");i.width=1024,i.height=128;const e=i.getContext("2d");e.fillStyle="#4b4f54",e.fillRect(0,0,1024,128),e.strokeStyle="#dfe3e6",e.lineWidth=6,e.setLineDash([60,45]),e.beginPath(),e.moveTo(10,64),e.lineTo(1014,64),e.stroke(),e.setLineDash([]),e.strokeRect(4,8,1016,112),e.fillStyle="#dfe3e6";for(let r=0;r<6;r++)e.fillRect(24,8+r*20,26,8);const t=new Gc(i);return t.anisotropy=8,t}function RA(){const i=new Zt,e=Xc(),t=new Pt(new Pn(e.runwayLength,.6,e.runwayWidth),new hn({map:CA(),roughness:1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));t.position.set(e.centerX,e.elevation-.28,e.centerZ),i.add(t);const r=new hn({color:8226704,roughness:.9}),o=new Pt(new Pn(60,18,40),r);o.position.set(e.centerX-200,e.elevation+9,e.centerZ-140),i.add(o);const a=new Pt(new Pn(60,18,40),r);a.position.set(e.centerX+120,e.elevation+9,e.centerZ-150),i.add(a);const c=new Pt(new Di(6,8,34,10),r);c.position.set(e.centerX-60,e.elevation+17,e.centerZ-160),i.add(c),t.receiveShadow=!0;for(const u of[o,a,c])u.castShadow=!0,u.receiveShadow=!0;return i}function N0(){const i=new Zt,e=new hn({color:659220,emissive:16767392,emissiveIntensity:0,roughness:.6}),t=[];for(const d of No()){const m=d.landingAngleDeg*Math.PI/180,g=Math.cos(m),v=Math.sin(m),S=d.deckY+.5,M=(90-d.headingDeg)*Math.PI/180,w=(y,_,L)=>{Math.abs(y)>d.deckLength/2||Math.abs(_)>d.deckWidth/2||t.push({x:d.x+y*Math.cos(M)+_*Math.sin(M),y:S,z:d.z-y*Math.sin(M)+_*Math.cos(M),rotY:M,len:L})};for(let y=6;y<=d.landingLength-6;y+=18)for(const _ of[-15,Qt.halfWidth])w(Qt.startAlong+y*g+_*v,Qt.startAcross-y*v+_*g,5);for(let y=-2;y<=2;y++){const _=Qt.halfWidth/2.5*y;w(Qt.startAlong+_*v,Qt.startAcross+_*g,3)}}{const d=Xc(),m=d.elevation+.4;for(let g=-d.runwayLength/2+20;g<=d.runwayLength/2-20;g+=45)for(const v of[-d.runwayWidth/2-1.5,d.runwayWidth/2+1.5])t.push({x:d.centerX+g,y:m,z:d.centerZ+v,rotY:0,len:5});for(let g=-3;g<=3;g++)t.push({x:d.centerX-d.runwayLength/2+4,y:m,z:d.centerZ+g*7,rotY:0,len:4}),t.push({x:d.centerX+d.runwayLength/2-4,y:m,z:d.centerZ+g*7,rotY:0,len:4})}const r=new Pn(1,.35,.9),o=new wT(r,e,t.length),a=new It,c=new kn,u=new B,f=new B;return t.forEach((d,m)=>{u.set(d.x,d.y,d.z),c.setFromAxisAngle(new B(0,1,0),d.rotY),f.set(d.len,1,1),a.compose(u,c,f),o.setMatrixAt(m,a)}),o.instanceMatrix.needsUpdate=!0,o.frustumCulled=!1,i.add(o),{group:i,material:e}}const PA=new hn({color:10134445,roughness:.55,metalness:.35}),r_=new hn({color:2304046,roughness:.85,metalness:.2}),bA=new hn({color:2768202,roughness:.15,metalness:.6,transparent:!0,opacity:.85}),LA=new To({color:8373503,transparent:!0,opacity:0,blending:Mo,depthWrite:!1,side:gi}),DA=new hn({color:9410722,roughness:.6,metalness:.3,side:gi});function ff(i,e,t){return new hn({color:i,roughness:e,metalness:t})}function Cn(i,e,t,r,o,a=0,c=0){const u=new Pn(1,1,1),f=u.attributes.position;for(let d=0;d<f.count;d++){const m=f.getZ(d),g=m+.5,v=i+(t-i)*g,S=e+(r-e)*g;f.setX(d,f.getX(d)*v+a*g),f.setY(d,f.getY(d)*S+c*g),f.setZ(d,m*o)}return u.computeVertexNormals(),u}function qt(i,e,t,r=0,o=0,a=0){const c=new Pt(e,t);return c.position.set(r,o,a),i.add(c),c}function U0(i,e){const t=new Di(i,i,e*2,12),r=new Pt(t,r_);return r.rotation.z=Math.PI/2,r}function s_(i="gray"){const e=new Zt,t=i==="bandit"?ff(9061432,.6,.3):PA,r=i==="bandit"?ff(2761252,.85,.2):r_,o=i==="bandit"?ff(7617072,.65,.25):DA,a=i==="bandit"?new hn({color:4008490,roughness:.15,metalness:.6,transparent:!0,opacity:.85}):bA;qt(e,Cn(.5,.45,1.7,1.5,1.9,0,-.08),t,0,.1,-8.6),qt(e,Cn(1.7,1.5,3,2.2,3.9),t,0,0,-5.9),qt(e,Cn(3,2.2,3.5,2.45,7),t,0,0,-.5),qt(e,Cn(3.5,2.45,3.1,2.1,4.6,0,.1),t,0,0,5.3),qt(e,Cn(3.1,2.1,2.6,1.6,1.8,0,-.25),t,0,0,8.5),qt(e,Cn(2,.7,2.3,.8,6),t,0,1.1,4.5),qt(e,Cn(1.2,.6,2,.8,2.2),t,0,.95,-2.9),qt(e,Cn(1,.34,2,.22,3),o,1.9,.28,-1.2),qt(e,Cn(1,.34,2,.22,3),o,-1.9,.28,-1.2);const c=new Zt;qt(c,Cn(1.2,1.7,1.1,1.9,3.2),t,2.25,-.1,-3),qt(c,Cn(1.2,1.7,1.1,1.9,3.2),t,-2.25,-.1,-3);const u=new Di(.52,.52,.3,16),f=qt(c,u,r,2.25,.2,-4.65);f.rotation.x=Math.PI/2;const d=qt(c,u,r,-2.25,.2,-4.65);d.rotation.x=Math.PI/2,e.add(c);const m=qt(e,new Xa(.85,16,12),a,0,1.15,-5.6);m.scale.set(.95,.8,2.3);const g=new Di(.58,.66,1.2,14,1,!0);for(const I of[-1,1]){const N=qt(e,g,r,I*.85,-.15,9.4);N.rotation.x=Math.PI/2}const v=new Id(.5,2.6,12,1,!0),S=new Pt(v,LA.clone());S.rotation.x=Math.PI/2,S.position.set(0,-.15,11),e.add(S);const M=[new Zt,new Zt],w=[],y=[];for(let I=0;I<2;I++){const N=I===0?1:-1,z=new Zt;z.position.set(N*1.55,.25,.8);const R=Cn(4.3,.3,2.3,.12,7.8);R.translate(0,0,3.9);const A=new Pt(R,o);A.rotation.y=N*(Math.PI/2),z.add(A);const F=new Zt;F.position.set(-N*1.85,0,2.9);const $=new Pn(1,.09,3.6),Y=new Pt($,o);Y.position.x=-N*.5,F.add(Y),A.add(F),e.add(z),M[I]=z,w[I]=A,y[I]=F}const _=[new Zt,new Zt];for(let I=0;I<2;I++){const N=I===0?1:-1,z=new Zt;z.position.set(N*1.35,-.45,7.4);const R=Cn(2,.16,1.1,.08,3.4);R.translate(0,0,1.7);const A=new Pt(R,o);A.rotation.y=N*(Math.PI/2),z.add(A),z.rotation.z=-N*.06,e.add(z),_[I]=z}const L=[];for(let I=0;I<2;I++){const N=I===0?1:-1,z=qt(e,Cn(.18,3,.14,2,3,.35,0),t,N*1.7,1.85,7.9),R=qt(z,new Pn(.1,2,.75),o,.2,-.35,1.75);L[I]=R}qt(e,Cn(.12,.8,.1,.5,1.6,0,.25),o,1.45,-1.05,6.9),qt(e,Cn(.12,.8,.1,.5,1.6,0,.25),o,-1.45,-1.05,6.9);const P=new Zt,T=new Di(.08,.08,.9,8);qt(P,T,r,0,-1.28,-6);const V=U0(.3,.12);V.position.set(0,-1.73,-6),P.add(V);for(const I of[-1,1]){const N=new Di(.1,.1,.8,8);qt(P,N,r,I*2.3,-1.25,.5);const z=U0(.33,.14);z.position.set(I*2.3,-1.7,.5),P.add(z)}return e.add(P),e.traverse(I=>{I.frustumCulled=!1;const N=I;N.isMesh&&(N.castShadow=!0,N.receiveShadow=!0)}),S.castShadow=!1,{group:e,wings:M,wingPanels:w,stabs:_,rudders:L,flaps:y,gear:P,canopy:m,intakes:c,afterburner:S}}const hr=Math.PI/180;function IA(i,e,t,r={}){const o=r.dayOfYear??172,a=r.tzOffsetHours??0,c=23.44*Math.sin(360/365.24*(o-81)*hr),u=360/364*(o-81)*hr,f=9.87*Math.sin(2*u)-7.53*Math.cos(u)-1.5*Math.sin(u),m=(i+(t/15-a)+f/60-12)*15,g=e*hr,v=c*hr,S=m*hr,M=Math.sin(g)*Math.sin(v)+Math.cos(g)*Math.cos(v)*Math.cos(S),w=Math.asin(UA(M,-1,1))/hr,y=Math.sin(S),_=Math.cos(S)*Math.sin(g)-Math.tan(v)*Math.cos(g);return{azimuthDeg:((Math.atan2(y,_)/hr+180)%360+360)%360,elevationDeg:w}}function NA(i){const e=i.azimuthDeg*hr,t=i.elevationDeg*hr,r=Math.cos(t);return{x:r*Math.sin(e),y:Math.sin(t),z:-r*Math.cos(e)}}function o_(i){return i<-6?"night":i<2?"twilight":i<12?"golden":"day"}function UA(i,e,t){return i<e?e:i>t?t:i}const Ht=i=>new ht(i);function FA(){return{sunColor:new ht,sunIntensity:2,hemiSky:new ht,hemiGround:new ht,hemiIntensity:.75,fogColor:new ht,fogNear:3500,fogFar:3e4,zenith:new ht,horizon:new ht,glow:.35,ambient:0,starsVisible:!1}}const F0={sun:Ht(16773853),hemiSky:Ht(12572927),hemiGround:Ht(7043669),fog:Ht(12571616),zenith:Ht(4029112),horizon:Ht(13161692),glow:.4,sunIntensity:2,hemiIntensity:.75},OA={sun:Ht(16756838),hemiSky:Ht(16762778),hemiGround:Ht(6050624),fog:Ht(14922890),zenith:Ht(3104658),horizon:Ht(15776120),glow:.85,sunIntensity:1.55,hemiIntensity:.6},kA={sun:Ht(16747085),hemiSky:Ht(9072540),hemiGround:Ht(3749167),fog:Ht(9075346),zenith:Ht(1914208),horizon:Ht(14256734),glow:.95,sunIntensity:.5,hemiIntensity:.42},O0={sun:Ht(10467048),hemiSky:Ht(2834278),hemiGround:Ht(1316895),fog:Ht(923430),zenith:Ht(396312),horizon:Ht(1450812),glow:.16,sunIntensity:.34,hemiIntensity:.3},qn=[{at:-18,p:O0},{at:-6,p:O0},{at:0,p:kA},{at:6,p:OA},{at:16,p:F0},{at:90,p:F0}];function zA(i,e){const t=i.elevationDeg;let r=qn[0],o=qn[qn.length-1];for(let f=0;f<qn.length-1;f++)if(t>=qn[f].at&&t<=qn[f+1].at){r=qn[f],o=qn[f+1];break}t<=qn[0].at?r=o=qn[0]:t>=qn[qn.length-1].at&&(r=o=qn[qn.length-1]);const a=o.at-r.at,c=a<=0?0:k0((t-r.at)/a);mo(e.sunColor,r.p.sun,o.p.sun,c),mo(e.hemiSky,r.p.hemiSky,o.p.hemiSky,c),mo(e.hemiGround,r.p.hemiGround,o.p.hemiGround,c),mo(e.fogColor,r.p.fog,o.p.fog,c),mo(e.zenith,r.p.zenith,o.p.zenith,c),mo(e.horizon,r.p.horizon,o.p.horizon,c),e.glow=Ta(r.p.glow,o.p.glow,c),e.sunIntensity=Ta(r.p.sunIntensity,o.p.sunIntensity,c),e.hemiIntensity=Ta(r.p.hemiIntensity,o.p.hemiIntensity,c);const u=1-k0(a_((t+6)/12,0,1));return e.ambient=u*.12,e.fogNear=Ta(3500,1400,u),e.fogFar=Ta(3e4,15e3,u),e.starsVisible=o_(t)==="night",e}function mo(i,e,t,r){i.copy(e).lerp(t,r)}function Ta(i,e,t){return i+(e-i)*t}function k0(i){const e=a_(i,0,1);return e*e*(3-2*e)}function a_(i,e,t){return i<e?e:i>t?t:i}class BA{constructor(e,t,r){ge(this,"renderer");ge(this,"scene");ge(this,"camera");ge(this,"jet");ge(this,"jetGroup");ge(this,"sun");ge(this,"oceanMat");ge(this,"quality");ge(this,"worldRoot",new Zt);ge(this,"nightRoot",new Zt);ge(this,"nightLights");ge(this,"sky");ge(this,"hemi");ge(this,"ambient");ge(this,"env",FA());ge(this,"sunDir",new B(0,1,0));ge(this,"tmpColor",new ht);this.quality=t,this.renderer=new xT({canvas:e,antialias:t!=="low",powerPreference:"high-performance"}),this.renderer.shadowMap.enabled=t!=="low",this.renderer.shadowMap.type=lv,this.scene=new yT,this.scene.fog=new bd(12571616,3500,3e4),this.camera=new mi(62,1,.5,48e3),this.camera.position.set(0,200,200),this.hemi=new iA(12572927,7043669,.75),this.scene.add(this.hemi),this.ambient=new aA(16777215,0),this.scene.add(this.ambient),this.sun=new oA(16773853,2),this.sun.position.set(4e3,5500,1500),this.scene.add(this.sun),this.scene.add(this.sun.target),this.sun.castShadow=t!=="low",this.sun.shadow.mapSize.set(2048,2048);const o=this.sun.shadow.camera;o.left=-60,o.right=60,o.top=60,o.bottom=-60,o.near=1,o.far=14e3,this.sun.shadow.bias=-1e-5,this.sun.shadow.normalBias=.05,this.sky=EA(),this.scene.add(this.sky.stars),this.scene.add(this.sky.mesh),this.nightLights=N0().material,this.scene.add(this.nightRoot);const a=wA();this.oceanMat=a.material,this.scene.add(a),this.scene.add(this.worldRoot),this.applyWorld(r),this.jet=s_(),this.jetGroup=this.jet.group,this.scene.add(this.jetGroup)}applyDaylight(e,t,r){const o=zA(e,this.env);this.sunDir.copy(t).normalize(),this.sun.position.copy(r).addScaledVector(this.sunDir,12e3),this.sun.target.position.copy(r),this.sun.target.updateMatrixWorld(),this.sun.color.copy(o.sunColor),this.sun.intensity=o.sunIntensity,this.hemi.color.copy(o.hemiSky),this.hemi.groundColor.copy(o.hemiGround),this.hemi.intensity=o.hemiIntensity,this.ambient.intensity=o.ambient;const c=this.scene.fog;c&&(c.color.copy(o.fogColor),c.near=o.fogNear,c.far=o.fogFar),this.renderer.setClearColor(o.fogColor,1),this.oceanMat.color.copy(o.fogColor).lerp(this.tmpColor.setRGB(.05,.16,.24),.75),this.nightLights.emissiveIntensity=HA((6-e.elevationDeg)/12)*2.4,this.sky.set(this.sunDir,o.sunColor,o.zenith,o.horizon,o.glow),this.sky.follow(r),this.sky.setStarsVisible(o.starsVisible)}applyWorld(e){B0(this.worldRoot),this.worldRoot.clear(),this.worldRoot.add(SA(this.quality,e)),this.worldRoot.add(RA());for(const r of No())this.worldRoot.add(AA(r));B0(this.nightRoot),this.nightRoot.clear();const t=N0();this.nightLights=t.material,this.nightRoot.add(t.group)}applyQuality(e){this.quality=e;const t=e!=="low";this.renderer.shadowMap.enabled=t,this.sun.castShadow=t;const r=e==="low"?.75:e==="medium"?Math.min(window.devicePixelRatio,1.5):Math.min(window.devicePixelRatio,2);this.renderer.setPixelRatio(r),this.resize()}resize(){const e=this.renderer.domElement,t=e.clientWidth||window.innerWidth,r=e.clientHeight||window.innerHeight;this.renderer.setSize(t,r,!1),this.camera.aspect=t/Math.max(r,1),this.camera.updateProjectionMatrix()}render(){const e=performance.now()/1e3,t=this.oceanMat.bumpMap;t&&t.offset.set(e*.006,e*.0025),this.renderer.render(this.scene,this.camera)}}function HA(i){return i<0?0:i>1?1:i}function z0(i){var t,r,o,a;const e=i;(t=e.map)==null||t.dispose(),(r=e.bumpMap)==null||r.dispose(),(o=e.roughnessMap)==null||o.dispose(),(a=e.normalMap)==null||a.dispose(),i.dispose()}function B0(i){i.traverse(e=>{const t=e;t.geometry&&t.geometry.dispose();const r=t.material;if(Array.isArray(r))for(const o of r)z0(o);else r&&z0(r)})}function VA(i,e,t,r){const o=i.group,a=pr.degToRad(20+48*e.sweepT);i.wings[0].rotation.y=-a,i.wings[1].rotation.y=a;const c=.45*e.flapT,u=df(o.userData.aileron??0,.5);i.flaps[0].rotation.z=c-u*.4,i.flaps[1].rotation.z=-(c+u*.4);const f=df(o.userData.elevator??0,.6);i.stabs[0].rotation.x=f,i.stabs[1].rotation.x=f;const d=df(o.userData.rudder??0,.5);i.rudders[0].rotation.y=d,i.rudders[1].rotation.y=d;const m=e.gearT;i.gear.visible=m>.02,i.gear.scale.y=Math.max(.08,m),i.gear.position.y=(1-m)*1.1+(m>.02?e.wheelPen:0);const g=i.afterburner.material,v=.85+.15*Math.sin(e.time*47)*Math.sin(e.time*31),S=e.abLevel;if(g.opacity=S*.85*v,i.afterburner.scale.set(.8+S*.5,1,1.6*S+.2),i.afterburner.visible=S>.02,o.userData.exhaustLight){const M=o.userData.exhaustLight;M.intensity=S*40*v}}function df(i,e){return i<-e?-e:i>e?e:i}const GA=new B(0,1,0);class WA{constructor(){ge(this,"mode","chase");ge(this,"yaw",0);ge(this,"pitch",0);ge(this,"orbitAngle",0);ge(this,"orbitTimer",0);ge(this,"cockpitPos",new B(0,1.15,-4.4));ge(this,"smoothed",new B);ge(this,"tmpQ",new kn);ge(this,"lookTarget",new B);ge(this,"actionOffset",new B);ge(this,"upTmp",new B);ge(this,"cockpitQ",new kn);ge(this,"cockpitReady",!1);ge(this,"tmpEuler",new vi)}cycle(){this.mode=this.mode==="chase"?"cockpit":this.mode==="cockpit"?"action":"chase",this.mode!=="chase"&&(this.yaw=0,this.pitch=0),this.cockpitReady=!1}label(){return this.mode==="cockpit"?"COCKPIT":this.mode==="chase"?"CHASE":"ACTION"}mouse(e,t){const r=this.mode==="cockpit"?1.5:2.6;this.yaw=pr.clamp(this.yaw-e*.004,-r,r),this.pitch=pr.clamp(this.pitch-t*.004,-1.2,1.2)}update(e,t,r,o,a,c=!1){if(this.mode==="cockpit"){this.cockpitReady?this.cockpitQ.slerp(r,1-Math.exp(-a*6)):(this.cockpitQ.copy(r),this.cockpitReady=!0),e.position.copy(t).add(this.cockpitPos.clone().applyQuaternion(this.cockpitQ)),e.quaternion.copy(this.cockpitQ),this.tmpEuler.set(this.pitch,this.yaw,0,"YXZ"),e.rotateY(this.tmpEuler.y),e.rotateX(this.tmpEuler.x-this.pitch*.15);return}if(this.mode==="chase"){const u=26+Math.min(o*.08,10),f=new B(0,7.5,u).applyQuaternion(r),d=new kn().setFromEuler(new vi(this.pitch,this.yaw,0,"YXZ")),m=f.clone().applyQuaternion(this.tmpQ.copy(r).multiply(d)),g=t.clone().add(m);this.smoothed.lerp(g,1-Math.exp(-a*8)),e.position.copy(this.smoothed),this.lookTarget.copy(t).add(new B(0,1.5,0).applyQuaternion(r)),e.up.set(0,1,0).applyQuaternion(r).lerp(new B(0,1,0),.55).normalize(),e.lookAt(this.lookTarget);return}if(c){this.orbitTimer+=a;const u=34+Math.sin(this.orbitTimer*.21)*6;this.orbitAngle+=a*.14;const f=t.x+Math.cos(this.orbitAngle)*u,d=t.z+Math.sin(this.orbitAngle)*u,m=t.y+9+Math.sin(this.orbitTimer*.33)*3;e.position.set(f,m,d),e.up.set(0,1,0),e.lookAt(t);return}this.actionOffset.set(0,8,30).applyQuaternion(r),e.position.copy(t).add(this.actionOffset),this.upTmp.set(0,1.5,0).applyQuaternion(r),this.lookTarget.copy(t).add(this.upTmp),e.up.set(0,1,0).applyQuaternion(r).lerp(GA,.5).normalize(),e.lookAt(this.lookTarget)}}class XA{constructor(){ge(this,"ctx",null);ge(this,"master",null);ge(this,"started",!1);ge(this,"whine",null);ge(this,"whineGain",null);ge(this,"whine2",null);ge(this,"whineGain2",null);ge(this,"rumbleSrc",null);ge(this,"rumbleGain",null);ge(this,"rumbleFilter",null);ge(this,"windSrc",null);ge(this,"windGain",null);ge(this,"windFilter",null);ge(this,"windQ",null);ge(this,"volume",.7)}start(){if(this.started)return;try{const u=window.AudioContext??window.webkitAudioContext;this.ctx=new u}catch{return}const e=this.ctx;if(!e)return;this.started=!0,this.master=e.createGain(),this.master.gain.value=this.volume,this.master.connect(e.destination),this.whine=e.createOscillator(),this.whine.type="sawtooth",this.whine.frequency.value=300;const t=e.createBiquadFilter();t.type="lowpass",t.frequency.value=2200,this.whineGain=e.createGain(),this.whineGain.gain.value=0,this.whine.connect(t).connect(this.whineGain).connect(this.master),this.whine.start(),this.whine2=e.createOscillator(),this.whine2.type="sawtooth",this.whine2.frequency.value=306,this.whineGain2=e.createGain(),this.whineGain2.gain.value=0,this.whine2.connect(this.whineGain2).connect(t),this.whine2.start();const r=e.createBuffer(1,e.sampleRate*2,e.sampleRate),o=r.getChannelData(0);let a=0;for(let u=0;u<o.length;u++){const f=Math.random()*2-1;a=(a+.02*f)/1.02,o[u]=a*3.5}const c=()=>{const u=e.createBufferSource();return u.buffer=r,u.loop=!0,u};this.rumbleSrc=c(),this.rumbleFilter=e.createBiquadFilter(),this.rumbleFilter.type="lowpass",this.rumbleFilter.frequency.value=200,this.rumbleGain=e.createGain(),this.rumbleGain.gain.value=0,this.rumbleSrc.connect(this.rumbleFilter).connect(this.rumbleGain).connect(this.master),this.rumbleSrc.start(),this.windSrc=c(),this.windFilter=e.createBiquadFilter(),this.windFilter.type="bandpass",this.windFilter.frequency.value=500,this.windFilter.Q.value=.8,this.windGain=e.createGain(),this.windGain.gain.value=0,this.windQ=e.createBiquadFilter(),this.windQ.type="highpass",this.windQ.frequency.value=150,this.windSrc.connect(this.windFilter).connect(this.windGain).connect(this.windQ).connect(this.master),this.windSrc.start()}resume(){var e;(e=this.ctx)==null||e.resume()}setVolume(e){this.volume=e,this.master&&this.ctx&&this.master.gain.setTargetAtTime(e,this.ctx.currentTime,.1)}update(e,t,r,o,a){var v,S,M,w,y,_,L,P;if(!this.ctx||!this.started)return;const c=this.ctx.currentTime,u=.08,f=a?0:1,d=240+1250*e+180*t,m=f*(.012+.05*e+.02*t);(v=this.whine)==null||v.frequency.setTargetAtTime(d,c,u),(S=this.whine2)==null||S.frequency.setTargetAtTime(d*1.51,c,u),(M=this.whineGain)==null||M.gain.setTargetAtTime(m,c,u),(w=this.whineGain2)==null||w.gain.setTargetAtTime(m*.6,c,u),(y=this.rumbleFilter)==null||y.frequency.setTargetAtTime(120+500*e+300*t,c,u),(_=this.rumbleGain)==null||_.gain.setTargetAtTime(f*(.05+.22*e+.25*t),c,u);const g=Math.min(1,r/320);(L=this.windFilter)==null||L.frequency.setTargetAtTime(300+1100*g,c,u),(P=this.windGain)==null||P.gain.setTargetAtTime(f*(.4*g*g+(o?.15:0)),c,u)}dispose(){var e,t,r,o,a;(e=this.whine)==null||e.stop(),(t=this.whine2)==null||t.stop(),(r=this.rumbleSrc)==null||r.stop(),(o=this.windSrc)==null||o.stop(),(a=this.ctx)==null||a.close(),this.started=!1}}class jA{constructor(e){ge(this,"bindings");ge(this,"sensitivity");ge(this,"down",new Set);ge(this,"pressedQueue",new Set);ge(this,"consumed",new Set);ge(this,"pitch",0);ge(this,"roll",0);ge(this,"yaw",0);ge(this,"mouseDX",0);ge(this,"mouseDY",0);ge(this,"dragging",!1);ge(this,"capture",null);ge(this,"el",null);ge(this,"onKeyBound",e=>this.onKeyDown(e));ge(this,"onKeyUpBound",e=>this.onKeyUp(e));ge(this,"onDownBound",e=>this.onMouseDown(e));ge(this,"onUpBound",()=>this.dragging=!1);ge(this,"onMoveBound",e=>this.onMouseMove(e));ge(this,"onBlurBound",()=>this.down.clear());this.bindings={...e.bindings},this.sensitivity=e.sensitivity}attach(e){this.el=e,window.addEventListener("keydown",this.onKeyBound),window.addEventListener("keyup",this.onKeyUpBound),window.addEventListener("blur",this.onBlurBound),e.addEventListener("mousedown",this.onDownBound),window.addEventListener("mouseup",this.onUpBound),window.addEventListener("mousemove",this.onMoveBound)}detach(){window.removeEventListener("keydown",this.onKeyBound),window.removeEventListener("keyup",this.onKeyUpBound),window.removeEventListener("blur",this.onBlurBound),this.el&&(this.el.removeEventListener("mousedown",this.onDownBound),this.el=null),window.removeEventListener("mouseup",this.onUpBound),window.removeEventListener("mousemove",this.onMoveBound)}applySettings(e){this.bindings={...e.bindings},this.sensitivity=e.sensitivity}onKeyDown(e){if(this.capture){e.preventDefault(),this.capture(e.code);return}if(e.repeat)return;const t=e.target;if(e.code!=="Escape"&&t&&(t.tagName==="INPUT"||t.tagName==="SELECT"||t.tagName==="TEXTAREA"||t.tagName==="BUTTON"||t.isContentEditable))return;const r=e.code,o=this.actionFor(r);o&&e.preventDefault(),this.down.add(r),o&&!this.consumed.has(o)&&(this.pressedQueue.add(o),this.consumed.add(o))}onKeyUp(e){this.down.delete(e.code);const t=this.actionFor(e.code);t&&this.consumed.delete(t)}onMouseDown(e){e.button===0&&(this.dragging=!0)}onMouseMove(e){this.dragging&&(this.mouseDX+=e.movementX??0,this.mouseDY+=e.movementY??0)}actionFor(e){for(const t of Object.keys(this.bindings))if(this.bindings[t]===e)return t;return null}isDown(e){return this.down.has(this.bindings[e])}take(e){return this.pressedQueue.has(e)?(this.pressedQueue.delete(e),!0):!1}clearEdges(){this.pressedQueue.clear()}sample(e){const t=3.6*this.sensitivity,r=(this.isDown("pitchUp")?1:0)-(this.isDown("pitchDown")?1:0),o=(this.isDown("rollRight")?1:0)-(this.isDown("rollLeft")?1:0),a=(this.isDown("yawRight")?1:0)-(this.isDown("yawLeft")?1:0);return this.pitch=pf(this.pitch,r,t*e),this.roll=pf(this.roll,o,t*e),this.yaw=pf(this.yaw,a,t*e),{pitch:mf(this.pitch),roll:mf(this.roll),yaw:mf(this.yaw),throttleUp:this.isDown("throttleUp"),throttleDown:this.isDown("throttleDown"),trimUp:this.isDown("trimUp"),trimDown:this.isDown("trimDown"),brake:this.isDown("brake"),catHold:this.isDown("cat"),fire:this.isDown("fire")}}takeMouse(){const e={dx:this.mouseDX,dy:this.mouseDY};return this.mouseDX=0,this.mouseDY=0,e}}function pf(i,e,t){return i<e?Math.min(i+t,e):i>e?Math.max(i-t,e):i}function mf(i){const e=Math.sign(i),t=Math.abs(i);return e*(.35*t+.65*t*t*t)}function YA(i){const e=Math.max(-500,Math.min(2e4,i));let t,r;e<11e3?(t=288.15-.0065*e,r=101325*Math.pow(t/288.15,5.2559)):(t=216.65,r=22632.06*Math.exp(-15769e-8*(e-11e3)));const o=r/(287.0531*t),a=20.0468*Math.sqrt(t);return{rho:o,temp:t,soundSpeed:a,sigma:o/1.225}}const Ao=3e4,pd=9.81,gf=54.6,qA=19.5,KA=4.88,H0=3e5,V0=5e5,G0=6e4,W0=.1,X0=5,go=.26,$A=.026,ZA=.05,QA=.135,JA=40,eC=-.45,tC=.16,nC=.075,iC=30,rC=.02,sC=.09,oC=.08,aC=.03,lC=1.6,cC=2.2,uC=2,hC=-.12,fC=.35,dC=15e4,j0=3500,pC=11e4,Od=-2.03,l_=.3,md=.33,mC={x:0,y:Od+l_,z:-6},vf={x:2.3,y:Od+md,z:.5},_f=-1.05,Ua=6e5,Fa=26e4,gC=18e5,c_=Ua*(3/13),gd=Ua*(18/13),vC=Fa*(3/13),Y0=Fa*(18/13),u_=Ao*pd/(c_+2*gd),q0=-Od-u_,_C=.08,xC=.7,Ac=27.6,K0=72,yC=27;function vd(i){const e=i*Math.PI/180;return new kn().setFromAxisAngle(new B(0,1,0),-e)}function Cc(i,e=0){const t=No(),r=Math.max(0,Math.min(e,t.length-1)),o=Xc();let a,c,u="idle";if(i==="carrier")a=h_(t[r]).start.clone(),a.y=t[r].deckY+q0,c=vd(t[r].headingDeg),u="ready";else{const f=o.centerX-o.runwayLength/2+120,d=o.centerZ;a=new B(f,o.elevation+q0,d),c=vd(o.headingDeg)}return{pos:a,vel:new B(0,0,0),quat:c,omega:new B(0,0,0),throttle:0,rpm:.05,abOn:!1,abLevel:0,gearDown:!0,gearT:1,flapsDown:!0,flapT:1,speedbrake:!1,sbT:0,brakeOn:!1,trim:.5,sweepT:0,sweep:20,speed:0,mach:0,alpha:0,gLoad:1,vspeed:0,headingDeg:i==="carrier"?t[r].headingDeg:o.headingDeg,stalled:!1,onGround:!0,groundKind:i==="carrier"?"deck":"runway",wheelPen:u_,catPhase:u,catProgress:0,arresting:!1,catCooldown:0,catCarrier:r,airborne:!1,flightTime:0,time:0,result:null,banner:i==="carrier"?{text:`CARRIER ${t[r].name} — HOLD SPACE FOR CATAPULT`,until:30}:{text:"THROTTLE UP (W) — ROTATE AT 150 KT",until:30},prevPos:a.clone(),prevQuat:c.clone()}}function h_(i){const{fwd:e,right:t}=$v(i.headingDeg);return{start:new B(i.x+e[0]*-40+t[0]*i.catapultOffsetX,0,i.z+e[1]*-40+t[1]*i.catapultOffsetX),dir:new B(e[0],0,e[1])}}const SC=Qt.startAlong,MC=Qt.startAcross,$0=Qt.halfWidth,wC=Qt.wireFirstS,EC=Qt.catchSMin,TC=Qt.catchSMax;function AC(i,e,t){const[r,o]=Zv(i,e,t),a=i.landingAngleDeg*Math.PI/180,c=Math.cos(a),u=Math.sin(a),f=r-SC,d=o-MC,m=f*c-d*u,g=f*u+d*c;return{s:m,d:g}}function CC(i,e,t){if(i.result)return;i.time+=t,i.flightTime+=t,e.throttleUp&&(i.throttle=rn(i.throttle+t*.5,0,1)),e.throttleDown&&(i.throttle=rn(i.throttle-t*.5,0,1)),e.trimUp&&(i.trim=rn(i.trim+t*.35,0,1)),e.trimDown&&(i.trim=rn(i.trim-t*.35,0,1)),i.brakeOn=e.brake||i.catPhase==="ready"||i.catPhase==="charging";const r=i.throttle>i.rpm?1.2:1.8;i.rpm+=(i.throttle-i.rpm)*(1-Math.exp(-t/r));const o=i.abOn&&i.throttle>.9?1:0;if(i.abLevel+=(o-i.abLevel)*(1-Math.exp(-t/.5)),i.gearT=rn(i.gearT+(i.gearDown?t/1.8:-t/1.8),0,1),i.flapT=rn(i.flapT+(i.flapsDown?t/2.2:-t/2.2),0,1),i.sbT=rn(i.sbT+(i.speedbrake?t/.9:-t/.9),0,1),i.catPhase==="ready"&&e.catHold&&(i.catPhase="charging",i.catProgress=0),i.catCooldown>0&&(i.catCooldown-=t),i.catPhase==="charging"){i.catProgress=rn(i.catProgress+t/.9,0,1),e.catHold?i.catProgress>=1&&(i.catPhase="firing",i.catProgress=0,i.banner={text:"CAT SHOT — PULL UP",until:i.time+3}):(i.catPhase="ready",i.catProgress=0);return}if(i.catPhase==="firing"){i.catProgress=rn(i.catProgress+t/(K0/Ac),0,1);const z=i.catProgress*(K0/Ac),R=No(),A=R[Math.min(i.catCarrier,R.length-1)],F=h_(A),$=.5*Ac*z*z,Y=Ac*z;i.pos.copy(F.start).addScaledVector(F.dir,$),i.pos.y=A.deckY+2.4,i.quat.copy(vd(A.headingDeg)).multiply(new kn().setFromAxisAngle(new B(1,0,0),.105)),i.vel.copy(F.dir).multiplyScalar(Y),i.speed=Y,i.mach=Y/340,i.vspeed=0,i.omega.set(0,0,0),i.catProgress>=1&&(i.catPhase="idle",i.airborne=!0,i.catCooldown=4);return}const a=YA(i.pos.y),c=i.quat.clone().invert(),u=i.vel.clone().applyQuaternion(c),f=u.length(),d=-u.z,m=f>1?Math.atan2(-u.y,Math.max(d,.5)):0,g=f>1?rn(Math.atan2(u.x,Math.max(d,.5)),-.5,.5):0;i.speed=f,i.mach=f/a.soundSpeed,i.alpha=m,i.vspeed=i.vel.y,i.headingDeg=(Math.atan2(Z0(i.quat).x,-Z0(i.quat).z)*180/Math.PI+360)%360,i.sweepT=rn((i.mach-.3)/.7,0,1),i.sweep+=(20+48*i.sweepT-i.sweep)*(1-Math.exp(-t/.7));const v=.5*a.rho*f*f,S=new B(0,0,0),M=new B(0,0,0);let w=0;if(f>1){const z=Math.abs(m),R=.8*i.flapT,A=i.sweepT;let F;if(z<=go)F=W0+R+X0*m;else{const Ae=W0+R+X0*go,Be=Math.max(.35,1-2.2*(z-go));F=Math.sign(m)*Ae*Be}const $=Math.max(0,z-go);let Y=$A-.004*A+ZA*(1-.12*A)*F*F;if(Y+=.018*i.gearT+.045*i.flapT+.07*i.sbT+.5*$,i.mach>.88){const Ae=rn((i.mach-.88)/.17,0,1);Y+=.045*Ae*Ae*(3-2*Ae)}const ie=v*gf,ce=ie*F,oe=ie*Y,ue=u.clone().divideScalar(f),G=new B(0,1,0).addScaledVector(ue,-ue.y);G.lengthSq()>1e-6?G.normalize():G.set(0,0,-Math.sign(d)||-1),S.addScaledVector(G,ce),S.addScaledVector(ue,-oe),S.x+=-.8*g*ie;const he=KA,ae=qA,k=v*gf*he,ee=v*gf*ae,Fe=1-fC*A,J=(i.trim-.5)*tC,fe=e.pitch*(i.stalled?.7:1),we=nC*rn(i.vspeed/22,-1,1)*(1-.6*Math.abs(e.pitch));M.x+=k*(J+eC*m+QA*fe-(JA+iC)*(i.omega.x*he/(2*Math.max(f,30)))-we),M.z+=ee*(oC*g-rC*Fe*e.roll-sC*(i.omega.z*ae/(2*Math.max(f,30))));const ve=rn(lC*(i.omega.y*ae/(2*Math.max(f,30)))+cC*g,-1,1);if(M.y+=ee*(hC*g-aC*(e.yaw+ve)-uC*(i.omega.y*ae/(2*Math.max(f,30)))),i.stalled=m>go*.92||m<-go*.92,i.stalled&&f>30){const Ae=i.time;M.x+=k*.012*Math.sin(Ae*21.3)*Math.sin(Ae*4.7),M.z+=ee*.02*Math.sin(Ae*17.7)*Math.sin(Ae*2.9)}else i.stalled=!1;w=ce/Ao}else i.stalled=!1;const y=a.sigma;let _=j0+(dC-j0)*i.rpm;_*=Math.pow(y,.75),i.abLevel>.01&&(_+=pC*i.abLevel*Math.pow(y,.6)),S.z-=_;const L=S.applyQuaternion(i.quat);L.y-=Ao*pd;const P=PC(i,t,e,L);i.vel.addScaledVector(L,t/Ao),i.pos.addScaledVector(i.vel,t);const T=M.x/H0,V=M.y/V0,I=M.z/G0;i.omega.x=rn(i.omega.x+T*t,-1.6,1.6),i.omega.y=rn(i.omega.y+V*t,-1,1),i.omega.z=rn(i.omega.z+I*t,-3.2,3.2),i.onGround&&i.speed<50&&(i.omega.y+=-e.yaw*1.4*t*(1-i.speed/50));const N=new kn(i.omega.x*t*.5,i.omega.y*t*.5,i.omega.z*t*.5,1).normalize();if(i.quat.multiply(N).normalize(),P.contacts>0&&(P.torqueBody&&(i.omega.x+=P.torqueBody.x/H0*t,i.omega.y+=P.torqueBody.y/V0*t,i.omega.z+=P.torqueBody.z/G0*t),i.omega.multiplyScalar(Math.exp(-t*3))),i.arresting){const z=new B(i.vel.x,0,i.vel.z),R=z.length();if(R>.01){const A=z.divideScalar(R),F=Math.max(0,R-yC*t);i.vel.set(A.x*F,i.vel.y*.9,A.z*F),F<.5&&(i.vel.set(0,0,0),i.result={kind:"wire",wire:i.wire??3,title:`CAUGHT WIRE ${i.wire??3}`,detail:"Trap confirmed. Nicely done, pilot."})}}i.onGround=P.contacts>0,i.groundKind=P.kind,i.onGround?i.airborne=!1:!i.onGround&&i.pos.y>RC(i)+2.5&&i.flightTime>1&&(i.airborne=!0),i.gLoad=i.onGround?1:w/pd}function Z0(i){return new B(0,0,-1).applyQuaternion(i)}function RC(i){return Ga(i.pos.x,i.pos.z).y}function PC(i,e,t,r){const o=i.omega.clone().applyQuaternion(i.quat);let a=0,c=i.groundKind,u=!1,f=0,d=0,m=new B,g=!1,v=!1,S=!1,M=!1;const w=[{...mC,wheel:!0,r:l_,k:c_,c:vC},{...vf,wheel:!0,r:md,k:gd,c:Y0},{x:-2.3,y:vf.y,z:vf.z,wheel:!0,r:md,k:gd,c:Y0},{x:0,y:_f,z:-5,wheel:!1,r:0,k:Ua,c:Fa},{x:0,y:_f,z:.5,wheel:!1,r:0,k:Ua,c:Fa},{x:0,y:-.2,z:6.5,wheel:!1,r:0,k:Ua,c:Fa}];for(const _ of w){const L=_.wheel?_.y+(_f+.05-_.y)*(1-i.gearT)-_.r:_.y,T=new B(_.x,L,_.z).clone().applyQuaternion(i.quat).add(i.pos),V=Ga(T.x,T.z),I=V.y-T.y;if(I<=0)continue;a++,c=V.kind,_.wheel&&(d=Math.max(d,I)),V.kind==="deck"?g=!0:V.kind==="runway"?v=!0:V.kind==="terrain"?S=!0:M=!0;const N=T.clone().sub(i.pos),z=i.vel.clone().add(o.clone().cross(N));!_.wheel&&I>.25&&(u=!0);const R=Math.min(gC,Math.max(0,_.k*Math.min(I,.5)-_.c*z.y));if(R>0){const A=new B(0,R,0),F=new B(z.x,0,z.z),$=F.length();let Y=0;if($>.001&&_.wheel){const ie=new B(i.vel.x,0,i.vel.z),ce=ie.length();if(ce>.001){const oe=i.brakeOn?xC:_C,ue=Ao/4*(ce/e)*.9;Y=Math.min(oe*R,ue),A.addScaledVector(ie.clone().divideScalar(ce),-Y)}}else $>.05&&(Y=Math.min(.9*R,Ao/4*($/e)*.9),A.addScaledVector(F.clone().divideScalar($),-Y));if(r.add(A),m.add(N.clone().cross(new B(0,R,0))),Y>0){const ie=new B(N.x,0,N.z),ce=F.clone().divideScalar($).multiplyScalar(-Y);m.add(ie.cross(ce))}}f=Math.min(f,z.y)}const y=a>0&&!i.onGround&&i.airborne;if(i.result||(M&&y?Aa(i,"DITCHED","The Tomcat is not a seaplane. Impact with the sea."):u&&y?Aa(i,"BELLY IMPACT","Structure hit the ground. Gear was not down (or down hard)."):S&&y?Aa(i,"TERRAIN IMPACT","Only the runway and the carrier deck are survivable surfaces."):y&&f<-6&&Aa(i,"HARD IMPACT",`Touchdown at ${Math.round(-f*196.85)} fpm — the gear gave way.`)),!i.result&&g&&i.airborne&&i.catCooldown<=0&&f<-.8&&f>-6&&i.speed>20&&i.gearT>.6){const _=Qv(i.pos.x,i.pos.z)??Jv(i.pos.x,i.pos.z),{s:L,d:P}=AC(_,i.pos.x,i.pos.z);if(Math.abs(P)<=$0&&L>=EC&&L<=TC){const T=rn(Math.round((L-wC)/_.wireSpacing)+1,1,_.wireCount);i.arresting=!0,i.wire=T,i.airborne=!1}else Math.abs(P)<=$0?(i.result={kind:"bolter",title:"BOLTER",detail:"Touched the deck but missed the wires. Go around."},i.airborne=!1):Aa(i,"DECK STRIKE","Missed the landing area entirely. That will cost you a jet.")}return!i.result&&v&&i.airborne&&f>-6&&(i.banner={text:`TOUCHDOWN — ${Math.round(-f*196.85)} FPM`,until:i.time+3},i.airborne=!1),i.wheelPen=d,{contacts:a,kind:c,torqueBody:m.lengthSq()>0?m.applyQuaternion(i.quat.clone().invert()):null}}function Aa(i,e,t){i.result={kind:"crash",title:e,detail:t},i.vel.multiplyScalar(.1),i.omega.multiplyScalar(.2)}const bC=[137,80,78,71,13,10,26,10];async function LC(i){if(i.length<8||bC.some((y,_)=>i[_]!==y))throw new Error("not a PNG");const e=new DataView(i.buffer,i.byteOffset,i.byteLength);let t=0,r=0,o=0,a=0,c=0;const u=[];let f=8;for(;f+12<=i.length;){const y=e.getUint32(f),_=String.fromCharCode(i[f+4],i[f+5],i[f+6],i[f+7]),L=f+8;if(_==="IHDR")t=e.getUint32(L),r=e.getUint32(L+4),o=i[L+8],a=i[L+9],c=i[L+12];else if(_==="IDAT")u.push(i.subarray(L,L+y));else if(_==="IEND")break;f=L+y+4}if(t<=0||r<=0)throw new Error("bad PNG header");if(o!==8)throw new Error(`unsupported PNG bit depth ${o}`);if(c!==0)throw new Error("interlaced PNG not supported");const d=a===0?1:a===2?3:a===4?2:a===6?4:-1;if(d<0)throw new Error(`unsupported PNG colour type ${a}`);const m=await DC(IC(u)),g=t*d;if(m.length<r*(g+1))throw new Error("truncated PNG data");const v=new Uint8Array(t*r*4);let S=new Uint8Array(g),M=new Uint8Array(g),w=0;for(let y=0;y<r;y++){const _=m[w++];M.set(m.subarray(w,w+g)),w+=g,NC(_,M,S,d);for(let P=0;P<t;P++){const T=P*d,V=(y*t+P)*4;if(d===1){const I=M[T];v[V]=I,v[V+1]=I,v[V+2]=I,v[V+3]=255}else if(d===2){const I=M[T];v[V]=I,v[V+1]=I,v[V+2]=I,v[V+3]=M[T+1]}else d===3?(v[V]=M[T],v[V+1]=M[T+1],v[V+2]=M[T+2],v[V+3]=255):(v[V]=M[T],v[V+1]=M[T+1],v[V+2]=M[T+2],v[V+3]=M[T+3])}const L=S;S=M,M=L}return{width:t,height:r,data:v}}async function DC(i){const e=new DecompressionStream("deflate"),t=e.writable.getWriter(),r=(async()=>{await t.write(i),await t.close()})(),o=await new Response(e.readable).arrayBuffer();return await r,new Uint8Array(o)}function IC(i){let e=0;for(const o of i)e+=o.length;const t=new Uint8Array(e);let r=0;for(const o of i)t.set(o,r),r+=o.length;return t}function NC(i,e,t,r){const o=e.length;if(i!==0){if(i===1){for(let a=r;a<o;a++)e[a]=e[a]+e[a-r]&255;return}if(i===2){for(let a=0;a<o;a++)e[a]=e[a]+t[a]&255;return}if(i===3){for(let a=0;a<o;a++){const c=a>=r?e[a-r]:0;e[a]=e[a]+(c+t[a]>>1)&255}return}if(i===4){for(let a=0;a<o;a++){const c=a>=r?e[a-r]:0,u=t[a],f=a>=r?t[a-r]:0;e[a]=e[a]+UC(c,u,f)&255}return}throw new Error(`bad PNG filter ${i}`)}}function UC(i,e,t){const r=i+e-t,o=Math.abs(r-i),a=Math.abs(r-e),c=Math.abs(r-t);return o<=a&&o<=c?i:a<=c?e:t}const Rc={id:"kauai",label:"Kauai, Hawaii",attribution:"Terrain & imagery © Mapbox © OpenStreetMap",centerLon:-159.47,centerLat:21.92,zoom:12,satelliteZoom:13,radiusMeters:15e3},fr=40075016686e-3,FC=fr/(2*Math.PI),pi=256;function OC(i){return i*fr/360}function kC(i){const e=i*Math.PI/180;return FC*Math.log(Math.tan(Math.PI/4+e/2))}function f_(i,e){const t=Math.cos(i.centerLat*Math.PI/180),r=OC(i.centerLon),o=kC(i.centerLat),a=2**e,c=fr/a,u=i.radiusMeters/t,f=(.5+(r-u)/fr)*a,d=(.5+(r+u)/fr)*a,m=(.5-(o+u)/fr)*a,g=(.5-(o-u)/fr)*a,v=Math.max(0,Math.floor(f)),S=Math.max(v,Math.min(a-1,Math.ceil(d)-1)),M=Math.max(0,Math.floor(m)),w=Math.max(M,Math.min(a-1,Math.ceil(g)-1)),y=S-v+1,_=w-M+1,L=y*pi,P=_*pi,T=c/pi*t,V=((v/a-.5)*fr-r)*t,I=(o-fr*(.5-M/a))*t;return{z:e,tx0:v,ty0:M,nx:y,ny:_,widthPx:L,heightPx:P,cellSize:T,worldX0:V,worldZ0:I,worldW:L*T,worldH:P*T}}function zC(i,e,t,r,o){return`https://api.mapbox.com/v4/mapbox.terrain-rgb/${e}/${t}/${r}.pngraw?access_token=${o}`}function BC(i,e,t,r,o){return`https://api.mapbox.com/v4/mapbox.satellite/${e}/${t}/${r}.jpg?access_token=${o}`}async function HC(i,e,t=i.zoom){const r=f_(i,t),o=new Float32Array(r.widthPx*r.heightPx),a=[];for(let v=0;v<r.ny;v++)for(let S=0;S<r.nx;S++)a.push((async()=>{const M=r.tx0+S,w=r.ty0+v,y=await fetch(zC(i,t,M,w,e));if(!y.ok)throw new Error(`terrain tile ${t}/${M}/${w}: HTTP ${y.status}`);const _=await LC(new Uint8Array(await y.arrayBuffer()));if(_.width!==pi||_.height!==pi)throw new Error(`terrain tile ${t}/${M}/${w}: unexpected ${_.width}x${_.height}`);for(let L=0;L<pi;L++){const P=(v*pi+L)*r.widthPx+S*pi;for(let T=0;T<pi;T++){const V=(L*pi+T)*4;o[P+T]=-1e4+(_.data[V]*65536+_.data[V+1]*256+_.data[V+2])*.1}}})());await Promise.all(a);const{cellSize:c,worldX0:u,worldZ0:f}=r,d=r.widthPx,m=r.heightPx;return{width:d,height:m,cellSize:c,worldX0:u,worldZ0:f,heights:o,sample:(v,S)=>{const M=Math.max(0,Math.min(d-1,(v-u)/c-.5)),w=Math.max(0,Math.min(m-1,(S-f)/c-.5)),y=Math.floor(M),_=Math.floor(w),L=Math.min(y+1,d-1),P=Math.min(_+1,m-1),T=M-y,V=w-_,I=o[_*d+y]*(1-T)+o[_*d+L]*T,N=o[P*d+y]*(1-T)+o[P*d+L]*T;return I*(1-V)+N*V}}}async function VC(i,e,t=i.satelliteZoom){if(typeof document>"u")throw new Error("satellite loader needs a DOM");const r=f_(i,t),o=document.createElement("canvas");o.width=r.widthPx,o.height=r.heightPx;const a=o.getContext("2d");if(!a)throw new Error("no 2d context");const c=[];for(let u=0;u<r.ny;u++)for(let f=0;f<r.nx;f++)c.push((async()=>{const d=r.tx0+f,m=r.ty0+u,g=await fetch(BC(i,t,d,m,e));if(!g.ok)throw new Error(`satellite tile ${t}/${d}/${m}: HTTP ${g.status}`);const v=await createImageBitmap(await g.blob());a.drawImage(v,f*pi,u*pi),v.close()})());return await Promise.all(c),{canvas:o,worldX0:r.worldX0,worldZ0:r.worldZ0,worldW:r.worldW,worldH:r.worldH}}const Q0=100,GC=10,WC=12,XC=34,jC=9,xf=1e3,YC=1.6,J0=9,qC=.005,KC=.016,$C=.75,Ca={pursue:235,close:215,evade:270,min:140},ZC=4300,ev=9500,QC=900,JC=1300,e2=.14,tv=80,t2=6,n2=6,i2=5,mn=new B,vo=new B,Kn=new B,Pc=new B,yf=new B,Xr=new B,zi=new B,Sf=new B,r2=new B,s2=new B(0,0,1),nv=new It,iv=new kn,o2=new B(0,0,1),Mf=new B(0,1,0),a2=new B;function Bi(i){const e=Math.sin(i*127.1+311.7)*43758.5453;return e-Math.floor(e)}class l2{constructor(e){ge(this,"active",!1);ge(this,"hull",Q0);ge(this,"kills",0);ge(this,"wave",0);ge(this,"nextId",0);ge(this,"bandits",[]);ge(this,"tracers",[]);ge(this,"flashPool",[]);ge(this,"gunCd",0);ge(this,"waveTimer",0);ge(this,"root",new Zt);ge(this,"tracerPool",[]);ge(this,"matPlayer");ge(this,"matBandit");const t=new Pn(.16,.16,4.6);this.matPlayer=new To({color:16769674,transparent:!0,opacity:.95,blending:Mo,depthWrite:!1}),this.matBandit=new To({color:16732224,transparent:!0,opacity:.95,blending:Mo,depthWrite:!1});for(let o=0;o<tv;o++){const a=new Pt(t,this.matPlayer);a.visible=!1,a.frustumCulled=!1,this.root.add(a),this.tracerPool.push(a)}const r=new Xa(1,12,8);for(let o=0;o<t2;o++){const a=new Pt(r,new To({color:16752704,transparent:!0,opacity:0,blending:Mo,depthWrite:!1}));a.visible=!1,this.root.add(a),this.flashPool.push({pos:new B,life:0,mesh:a})}e.add(this.root)}begin(e){this.clear(),this.active=!0,this.hull=Q0,this.kills=0,this.wave=1,this.waveTimer=0,this.spawnWave(e),this.banner(e,`WAVE 1 — ${this.bandits.length} BANDITS INBOUND — WEAPONS FREE`)}clear(){this.active=!1,this.clearBandits();for(const e of this.tracers)e.mesh.visible=!1,this.tracerPool.push(e.mesh);this.tracers=[];for(const e of this.flashPool)e.life=0,e.mesh.visible=!1}dispose(){this.root.removeFromParent(),this.root.traverse(e=>{var o;const t=e;(o=t.geometry)==null||o.dispose();const r=t.material;r==null||r.dispose()}),this.bandits=[],this.tracers=[],this.flashPool=[],this.tracerPool=[]}step(e,t,r){if(!this.active||t.result)return!1;this.playerGuns(e,t,r);for(const o of this.bandits)this.stepBandit(o,e,t),this.banditGuns(o,e,t);return this.stepTracers(e,t),this.stepFlashes(e),this.stepWaves(e,t),!1}hud(e){let t=null,r=1/0;for(const c of this.bandits){const u=c.pos.distanceTo(e.pos);u<r&&(r=u,t=c)}const o=((t==null?void 0:t.pos.x)??0)-e.pos.x,a=((t==null?void 0:t.pos.z)??0)-e.pos.z;return{active:this.active,hull:Math.max(0,Math.round(this.hull)),kills:this.kills,wave:this.wave,bandits:this.bandits.length,nearestKm:t?r/1e3:0,nearestBrgDeg:t?Math.atan2(o,-a)*180/Math.PI:0,markers:this.bandits.map(c=>({x:c.pos.x,z:c.pos.z}))}}targets(){const e=[];for(const t of this.bandits){const r=new B(0,0,-1).applyQuaternion(t.quat).multiplyScalar(t.speed);e.push({pos:t.pos.clone(),vel:r})}return e}clearBandits(){for(const e of this.bandits)e.mesh.group.removeFromParent(),e.mesh.group.traverse(t=>{var a;const r=t;(a=r.geometry)==null||a.dispose();const o=r.material;o==null||o.dispose()});this.bandits=[]}spawnWave(e){const t=Math.min(1+this.wave,i2),r=this.playerHeading(e);for(let o=0;o<t;o++){const a=this.nextId++,c=r+(Bi(a*3.7+this.wave*13.1)*2-1)*2.4,u=5200+Bi(a*7.3+1.1)*2200,f=e.pos.x+Math.sin(c)*u,d=e.pos.z-Math.cos(c)*u,m=Math.max(e.pos.y+300+Bi(a*5.9+2.7)*700,Ga(f,d).y+450,700),g=s_("bandit");g.gear.visible=!1,g.afterburner.visible=!1,g.wings[0].rotation.y=-1,g.wings[1].rotation.y=1,g.group.position.set(f,m,d),this.root.add(g.group);const v={id:a,hp:XC,pos:new B(f,m,d),quat:new kn,bank:0,speed:Ca.pursue,fireCd:2+Bi(a)*2,burst:0,evadeT:0,phase:Bi(a*11.3)*Math.PI*2,mesh:g};this.aimQuat(v,zi.copy(e.pos).sub(v.pos).normalize(),0),this.bandits.push(v)}}playerHeading(e){return mn.set(0,0,-1).applyQuaternion(e.quat),Math.atan2(mn.x,-mn.z)}aimQuat(e,t,r){nv.lookAt(a2,t,Mf),e.quat.setFromRotationMatrix(nv),iv.setFromAxisAngle(o2,r),e.quat.multiply(iv)}stepBandit(e,t,r){mn.set(0,0,-1).applyQuaternion(e.quat),vo.copy(r.pos).sub(e.pos);const o=vo.length(),a=mn.dot(vo)<-.35*o;e.evadeT>0?e.evadeT-=t:a&&o<QC&&(e.evadeT=4+Bi(e.id+r.time)*2),e.evadeT>0?(zi.set(1,0,0).applyQuaternion(e.quat),Kn.copy(mn).addScaledVector(zi,Math.sin(r.time*1.9+e.phase)*.95).addScaledVector(Mf,Math.cos(r.time*1.4+e.phase)*.45+.2),Kn.normalize(),e.speed+=(Ca.evade-e.speed)*(1-Math.exp(-t/1.2))):(Pc.copy(r.pos).addScaledVector(r.vel,Math.min(o/xf,1.2)*.8),Kn.copy(Pc).sub(e.pos).normalize(),e.speed+=((o>3e3?Ca.pursue:Ca.close)-e.speed)*(1-Math.exp(-t/1.5))),yf.copy(e.pos).addScaledVector(Kn,1200);const c=Ga(yf.x,yf.z).y+260,u=(c-e.pos.y)/1200;u>Kn.y&&(Kn.y=u,Kn.normalize()),e.pos.y<c&&(Kn.y=Math.max(Kn.y,.5)),e.pos.y>ZC&&(Kn.y=Math.min(Kn.y,-.1)),(Math.abs(e.pos.x)>ev||Math.abs(e.pos.z)>ev)&&Kn.addScaledVector(zi.copy(e.pos).multiplyScalar(-1).normalize(),.8).normalize();const f=mn.angleTo(Kn);let d=0;f>1e-4&&(Xr.crossVectors(mn,Kn),Xr.lengthSq()<1e-8?Xr.copy(Mf):Xr.normalize(),d=Math.sign(Xr.y),mn.applyAxisAngle(Xr,Math.min(f,$C*t)));const m=f>.05?d*Math.min(f*1.6,1.15):0;e.bank+=(m-e.bank)*(1-Math.exp(-t*2.5)),this.aimQuat(e,mn,e.bank),e.pos.addScaledVector(mn,Math.max(e.speed,Ca.min)*t),e.mesh.group.position.copy(e.pos),e.mesh.group.quaternion.copy(e.quat)}banditGuns(e,t,r){if(e.fireCd-=t,e.fireCd>0)return;mn.set(0,0,-1).applyQuaternion(e.quat),vo.copy(r.pos).sub(e.pos);const o=vo.length(),a=mn.angleTo(vo);if(!(o>JC||a>e2||o<60)){if(e.burst<=0){e.burst=6+Math.floor(Bi(e.id*17.7+r.time)*4),e.fireCd=1.4+Bi(e.id*3.1+r.time*.7)*1.4;return}e.burst--,e.fireCd=.09,Pc.copy(r.pos).addScaledVector(r.vel,o/xf),zi.copy(Pc).sub(e.pos).normalize(),this.scatter(zi,KC,r.time*13.7+e.id*3.3),this.spawnTracer(e.pos,zi,!0,0)}}playerGuns(e,t,r){if(!r){this.gunCd=0;return}for(this.gunCd-=e;this.gunCd<=0;)this.gunCd+=1/GC,mn.set(0,0,-1).applyQuaternion(t.quat),zi.copy(t.pos).addScaledVector(mn,8),this.scatter(mn,qC,t.time*31.7+this.gunCd*97),this.spawnTracer(zi,mn,!1,t.vel.length())}spawnTracer(e,t,r,o){if(this.tracers.length>=tv||this.tracerPool.length===0)return;const a=this.tracerPool.pop();a.material=r?this.matBandit:this.matPlayer,a.visible=!0,a.position.copy(e),this.tracers.push({pos:e.clone(),vel:t.clone().multiplyScalar(xf+o),life:YC,hostile:r,mesh:a})}stepTracers(e,t){for(let r=this.tracers.length-1;r>=0;r--){const o=this.tracers[r];o.life-=e;const a=zi.copy(o.pos);o.pos.addScaledVector(o.vel,e),o.mesh.position.copy(o.pos),o.mesh.quaternion.setFromUnitVectors(s2,r2.copy(o.vel).normalize());let c=o.life<=0;if(!c){if(o.hostile)rv(a,o.pos,t.pos,J0)&&(this.damagePlayer(t,jC),c=!0);else for(const u of this.bandits)if(rv(a,o.pos,u.pos,J0)){u.hp-=WC,c=!0,u.hp<=0&&this.killBandit(u,t);break}}c&&(o.mesh.visible=!1,this.tracerPool.push(o.mesh),this.tracers.splice(r,1))}}killBandit(e,t){const r=this.bandits.indexOf(e);r>=0&&this.bandits.splice(r,1),this.kills++,this.flash(e.pos),e.mesh.group.removeFromParent(),e.mesh.group.traverse(a=>{var f;const c=a;(f=c.geometry)==null||f.dispose();const u=c.material;u==null||u.dispose()});const o=this.bandits.length;this.banner(t,o>0?`SPLASH ONE — ${o} BANDIT${o>1?"S":""} LEFT`:"SPLASH ONE — FIGHT'S CLEAR")}damagePlayer(e,t){const r=this.hull;this.hull-=t,r>60&&this.hull<=60&&this.banner(e,"TAKING HITS — HULL 60%"),r>30&&this.hull<=30&&this.banner(e,"HULL CRITICAL — DISENGAGE"),this.hull<=0&&!e.result&&(e.result={kind:"crash",title:"SHOT DOWN",detail:`Downed by a bandit over the islands. ${this.kills} kill${this.kills===1?"":"s"}.`})}stepWaves(e,t){if(!(this.bandits.length>0)){if(this.waveTimer<=0){this.waveTimer=n2,this.wave>0&&this.banner(t,`WAVE ${this.wave} CLEARED — ${this.kills} KILLS`);return}this.waveTimer-=e,this.waveTimer<=0&&(this.wave++,this.spawnWave(t),this.banner(t,`WAVE ${this.wave} — ${this.bandits.length} BANDITS INBOUND`))}}flash(e){const t=this.flashPool.find(r=>r.life<=0);t&&(t.pos.copy(e),t.life=1,t.mesh.visible=!0)}stepFlashes(e){for(const t of this.flashPool){if(t.life<=0)continue;if(t.life-=e*1.8,t.life<=0){t.mesh.visible=!1;continue}const r=3+(1-t.life)*26;t.mesh.position.copy(t.pos),t.mesh.scale.setScalar(r),t.mesh.material.opacity=t.life*.9}}scatter(e,t,r){const o=Bi(r)*Math.PI*2,a=t*(Bi(r+.5)*2-1);Sf.set(Math.cos(o),Math.sin(o),0),Math.abs(e.z)>.95&&Sf.set(1,0,0),Xr.crossVectors(e,Sf).normalize(),e.applyAxisAngle(Xr,a)}banner(e,t){e.banner={text:t,until:e.time+3}}}function rv(i,e,t,r){const o=e.x-i.x,a=e.y-i.y,c=e.z-i.z,u=t.x-i.x,f=t.y-i.y,d=t.z-i.z,m=o*o+a*a+c*c,g=m>1e-9?Math.max(0,Math.min(1,(u*o+f*a+d*c)/m)):0,v=u-o*g,S=f-a*g,M=d-c*g;return v*v+S*S+M*M<=r*r}const vs=1/120,c2=-10,u2=new Intl.DateTimeFormat("en-US",{timeZone:"Pacific/Honolulu",hour:"numeric",minute:"numeric",hour12:!1});function sv(){var r,o;const i=u2.formatToParts(new Date),e=Number(((r=i.find(a=>a.type==="hour"))==null?void 0:r.value)??"12"),t=Number(((o=i.find(a=>a.type==="minute"))==null?void 0:o.value)??"0");return e%24+t/60}function h2(){const i=new Date,e=Date.UTC(i.getUTCFullYear(),0,0);return Math.floor((i.getTime()-e)/864e5)}function f2(){return{speedKt:0,altFt:0,mach:0,headingDeg:0,aoaDeg:0,vsFpm:0,gLoad:1,throttlePct:0,rpmPct:0,ab:0,gear:!0,flaps:!1,speedbrake:!1,trim:.5,sweepDeg:20,stalled:!1,onGround:!0,catPhase:"ready",catProgress:0,pitchDeg:0,rollDeg:0,cameraMode:"chase",flightTime:0,distCarrierKm:0,bearingCarrierDeg:0,carrierName:"—",distFieldKm:0,bearingFieldDeg:0,worldLabel:"Procedural islands",worldAttribution:null,radarAltFt:0,playerX:0,playerZ:0,playerHeadingDeg:0,carrierMarkers:[],fieldX:0,fieldZ:0,worldExtent:12e3,localHour:12,dayPhase:"day",dfActive:!1,dfHull:100,dfKills:0,dfWave:1,dfBandits:0,dfNearestKm:0,dfNearestBrgDeg:0,enemyMarkers:[]}}class d2{constructor(e,t){ge(this,"phase","menu");ge(this,"renderer");ge(this,"rig",new WA);ge(this,"audio",new XA);ge(this,"input");ge(this,"settings");ge(this,"state");ge(this,"mission","carrier");ge(this,"acc",0);ge(this,"last",0);ge(this,"raf",0);ge(this,"prevPos",new B);ge(this,"prevQuat",new kn);ge(this,"hud",f2());ge(this,"hudListeners",new Set);ge(this,"phaseListeners",new Set);ge(this,"lastHudNotify",0);ge(this,"worldId","archipelago");ge(this,"worldState",{status:"ready",id:"archipelago"});ge(this,"worldListeners",new Set);ge(this,"spawnCarrier",0);ge(this,"nextCarrier",0);ge(this,"onResize",()=>this.renderer.resize());ge(this,"inputPitch",0);ge(this,"inputRoll",0);ge(this,"inputYaw",0);ge(this,"dayHours");ge(this,"dayPhase","day");ge(this,"sunVec",new B(0,1,0));ge(this,"df");ge(this,"loop",e=>{this.raf=requestAnimationFrame(this.loop);const t=e/1e3,r=Math.min(.05,Math.max(1e-4,t-this.last));if(this.last=t,this.phase==="flying"){this.handleEdges();const o=this.input.sample(vs);this.inputPitch=o.pitch,this.inputRoll=o.roll,this.inputYaw=o.yaw,this.stepSim(o,r)}else this.phase==="paused"?this.input.take("pause")&&this.resume():this.phase==="result"&&(this.input.take("pause"),this.updateJetPose(1),this.updateAudio());this.advanceDaylight(r),this.updateCamera(r),this.updateSun(),this.renderer.render()});this.settings=t,this.dayHours=this.resolveDayHours(t),this.renderer=new BA(e,t.quality,{height:dd,style:"island",texture:null}),this.renderer.applyQuality(t.quality),this.input=new jA(t),this.audio.setVolume(t.volume),this.df=new l2(this.renderer.scene),this.input.attach(e),window.addEventListener("resize",this.onResize),this.state=Cc("carrier"),this.updateJetPose(1),this.updateHud(),this.raf=requestAnimationFrame(this.loop)}applySettings(e){const t=e.quality!==this.settings.quality,r=e.daylight!==this.settings.daylight||e.timeOfDay!==this.settings.timeOfDay,o=e.gameMode!==this.settings.gameMode;this.settings=e,this.input.applySettings(e),this.audio.setVolume(e.volume),t&&this.renderer.applyQuality(e.quality),r&&(this.dayHours=this.resolveDayHours(e)),o&&(e.gameMode==="dogfight"&&this.phase==="flying"?this.df.begin(this.state):this.df.clear())}resolveDayHours(e){return e.daylight==="live"?sv():e.daylight==="fixed"?e.timeOfDay:this.dayHours??e.timeOfDay}advanceDaylight(e){this.settings.daylight==="live"?this.dayHours=sv():this.settings.daylight==="cycle"?this.dayHours=(this.dayHours+e/60*(24/pA))%24:this.dayHours=this.settings.timeOfDay}get localHour(){return this.dayHours}startMission(e){e==="carrier"&&(this.spawnCarrier=this.nextCarrier,this.nextCarrier=(this.nextCarrier+1)%No().length),this.beginMission(e,this.spawnCarrier)}beginMission(e,t){this.mission=e,this.state=Cc(e,t),this.settings.gameMode==="dogfight"?this.df.begin(this.state):this.df.clear(),this.prevPos.copy(this.state.pos),this.prevQuat.copy(this.state.quat),this.setPhase("flying"),this.acc=0,this.last=performance.now()/1e3,this.input.clearEdges(),this.audio.start(),this.audio.resume(),this.updateHud()}resume(){this.phase==="paused"&&(this.setPhase("flying"),this.last=performance.now()/1e3,this.input.clearEdges()),this.audio.resume()}pause(){this.phase==="flying"&&this.setPhase("paused")}restart(){this.beginMission(this.mission,this.spawnCarrier)}quitToMenu(){this.df.clear(),this.state=Cc(this.mission,this.spawnCarrier),this.updateJetPose(1),this.audio.update(.05,0,0,!1,!0),this.setPhase("menu")}cycleCamera(){this.rig.cycle()}setCameraMode(e){this.rig.mode=e}setPhase(e){this.phase=e;for(const t of this.phaseListeners)t(e)}subscribePhase(e){return this.phaseListeners.add(e),e(this.phase),()=>{this.phaseListeners.delete(e)}}get snapshot(){return this.hud}subscribeHud(e){return this.hudListeners.add(e),e(this.hud),()=>{this.hudListeners.delete(e)}}subscribeWorld(e){return this.worldListeners.add(e),e(this.worldState),()=>{this.worldListeners.delete(e)}}get worldStateSnapshot(){return this.worldState}async setWorldKind(e){if(e===this.worldId&&this.worldState.status==="ready")return null;if(e==="archipelago")return R0(),this.worldId="archipelago",this.renderer.applyWorld(this.paint(null)),this.setWorldState({status:"ready",id:"archipelago"}),this.afterWorldChange(),null;this.setWorldState({status:"loading",id:e});try{const t="pk.eyJ1IjoiZGFuaWxvd2UyOCIsImEiOiJjbXVxYXdoN2QwNG92MnpxMXlsdTN4eTR4In0.1lpdKhIQm6EgRwNEob2nmw",r=await HC(Rc,t);lA(fd,hA(r));let o=null;try{o=await VC(Rc,t)}catch{o=null}return this.worldId="kauai",this.renderer.applyWorld(this.paint(o)),this.setWorldState({status:"ready",id:"kauai"}),this.afterWorldChange(),null}catch(t){const r=t instanceof Error?t.message:String(t);return R0(),this.worldId="archipelago",this.renderer.applyWorld(this.paint(null)),this.setWorldState({status:"error",id:"archipelago",error:`Couldn't load Mapbox terrain (${r}) — staying on the procedural islands.`}),this.afterWorldChange(),r}}paint(e){const t=lf();return{height:dd,style:t.id==="kauai"?"tropical":"island",texture:e}}setWorldState(e){this.worldState=e;for(const t of this.worldListeners)t(e)}afterWorldChange(){this.state=Cc(this.mission,this.spawnCarrier),this.prevPos.copy(this.state.pos),this.prevQuat.copy(this.state.quat),this.updateJetPose(1),this.updateHud()}dispose(){cancelAnimationFrame(this.raf),this.df.dispose(),window.removeEventListener("resize",this.onResize),this.input.detach(),this.audio.dispose(),this.renderer.renderer.dispose()}handleEdges(){if(this.input.take("pause")){this.pause();return}this.input.take("camera")&&this.rig.cycle(),this.input.take("gear")&&(this.state.onGround&&this.state.speed<1?this.pushBanner("GEAR LOCKED — cannot retract while parked"):this.state.gearDown=!this.state.gearDown),this.input.take("flaps")&&(this.state.flapsDown=!this.state.flapsDown),this.input.take("speedbrake")&&(this.state.speedbrake=!this.state.speedbrake),this.input.take("ab")&&(this.state.abOn=!this.state.abOn),this.input.take("cat")}stepSim(e,t){this.acc=Math.min(this.acc+t,.25);let r=0;for(;this.acc>=vs&&r<8;)this.prevPos.copy(this.state.pos),this.prevQuat.copy(this.state.quat),CC(this.state,e,vs),this.df.step(vs,this.state,e.fire===!0),this.acc-=vs,r++;this.state.result&&this.phase==="flying"&&this.setPhase("result");const o=r>0?pr.clamp(this.acc/vs,0,1):1;this.updateJetPose(o),this.updateAudio(),this.updateHud()}updateJetPose(e){const t=this.state,r=this.renderer.jetGroup;r.position.lerpVectors(this.prevPos,t.pos,e);const o=this.prevQuat.clone().slerp(t.quat,e);r.quaternion.copy(o),r.userData.elevator=-this.inputPitch*.6,r.userData.aileron=this.inputRoll*.5,r.userData.rudder=this.inputYaw*.5,VA(this.renderer.jet,t)}updateCamera(e){var f,d;const t=this.state,r=pr.clamp(this.acc/vs,0,1),o=new B().lerpVectors(this.prevPos,t.pos,r),a=this.prevQuat.clone().slerp(t.quat,r),c=this.input.takeMouse();this.rig.mouse(c.dx,c.dy);const u=this.phase==="menu"||this.phase==="result"&&((f=t.result)==null?void 0:f.kind)==="crash";this.rig.update(this.renderer.camera,o,a,t.speed,e,u),this.renderer.jetGroup.visible=this.rig.mode!=="cockpit"||this.phase==="menu",this.phase==="menu"&&(this.rig.mode="action"),this.phase==="result"&&((d=t.result)==null?void 0:d.kind)==="crash"&&(this.rig.mode="action")}updateAudio(){const e=this.state;this.audio.update(e.rpm,e.abLevel,e.speed,e.stalled&&!e.onGround,this.phase!=="flying")}updateSun(){const e=this.state.pos,t=IA(this.dayHours,Rc.centerLat,Rc.centerLon,{dayOfYear:h2(),tzOffsetHours:c2});this.dayPhase=o_(t.elevationDeg);const r=NA(t);this.sunVec.set(r.x,r.y,r.z),this.renderer.applyDaylight(t,this.sunVec,e)}pushBanner(e){this.state.banner={text:e,until:this.state.time+3}}updateHud(){var _,L,P;const e=this.state,t=new B(0,0,-1).applyQuaternion(e.quat),r=new B(1,0,0).applyQuaternion(e.quat),o=Math.asin(pr.clamp(t.y,-1,1))*(180/Math.PI),a=Math.asin(pr.clamp(r.y,-1,1))*(180/Math.PI),c=e.pos.y-this.groundRef(e),u=Xc(),f=No(),d=Jv(e.pos.x,e.pos.z),m=d.x-e.pos.x,g=d.z-e.pos.z,v=u.centerX-e.pos.x,S=u.centerZ-e.pos.z,M=Math.atan2(m,-g)*180/Math.PI,w=Math.atan2(v,-S)*180/Math.PI;this.hud={speedKt:e.speed*1.94384,altFt:e.pos.y*3.28084,mach:e.mach,headingDeg:e.headingDeg,aoaDeg:e.alpha*57.2958,vsFpm:e.vspeed*196.85,gLoad:e.gLoad,throttlePct:Math.round(e.throttle*100),rpmPct:Math.round(e.rpm*100),ab:e.abLevel,gear:e.gearDown&&e.gearT>.95,flaps:e.flapsDown&&e.flapT>.95,speedbrake:e.speedbrake&&e.sbT>.95,trim:e.trim,sweepDeg:Math.round(20+48*e.sweepT),stalled:e.stalled,onGround:e.onGround,catPhase:e.catPhase,catProgress:e.catProgress,pitchDeg:o,rollDeg:a,cameraMode:this.rig.mode,wire:e.wire,resultTitle:(_=e.result)==null?void 0:_.title,resultDetail:(L=e.result)==null?void 0:L.detail,resultKind:(P=e.result)==null?void 0:P.kind,banner:e.banner&&e.time<e.banner.until?e.banner.text:void 0,radarAltFt:c*3.28084,flightTime:e.flightTime,distCarrierKm:Math.hypot(m,g)/1e3,bearingCarrierDeg:(M+360)%360,carrierName:d.name,distFieldKm:Math.hypot(v,S)/1e3,bearingFieldDeg:(w+360)%360,worldLabel:lf().label,worldAttribution:lf().attribution,playerX:e.pos.x,playerZ:e.pos.z,playerHeadingDeg:e.headingDeg,carrierMarkers:f.map(T=>({name:T.name,x:T.x,z:T.z,near:T.name===d.name})),fieldX:u.centerX,fieldZ:u.centerZ,worldExtent:zc,localHour:this.dayHours,dayPhase:this.dayPhase,...this.dfHud()};const y=performance.now();if(y-this.lastHudNotify>50){this.lastHudNotify=y;for(const T of this.hudListeners)T(this.hud)}}groundRef(e){return Ga(e.pos.x,e.pos.z).y}dfHud(){const e=this.df.hud(this.state);return{dfActive:e.active,dfHull:e.hull,dfKills:e.kills,dfWave:e.wave,dfBandits:e.bandits,dfNearestKm:e.nearestKm,dfNearestBrgDeg:(e.nearestBrgDeg+360)%360,enemyMarkers:e.markers}}}function d_(i){const e=t=>i?i.subscribeHud(()=>t()):()=>{};return _n.useSyncExternalStore(e,()=>i?i.snapshot:null,()=>null)??p2}const p2={speedKt:0,altFt:0,mach:0,headingDeg:0,aoaDeg:0,vsFpm:0,gLoad:1,throttlePct:0,rpmPct:0,ab:0,gear:!0,flaps:!1,speedbrake:!1,trim:.5,sweepDeg:20,stalled:!1,onGround:!0,catPhase:"ready",catProgress:0,pitchDeg:0,rollDeg:0,cameraMode:"chase",flightTime:0,distCarrierKm:0,bearingCarrierDeg:0,carrierName:"—",distFieldKm:0,bearingFieldDeg:0,worldLabel:"Procedural islands",worldAttribution:null,radarAltFt:0,playerX:0,playerZ:0,playerHeadingDeg:0,carrierMarkers:[],fieldX:0,fieldZ:0,worldExtent:12e3,localHour:12,dayPhase:"day",dfActive:!1,dfHull:100,dfKills:0,dfWave:1,dfBandits:0,dfNearestKm:0,dfNearestBrgDeg:0,enemyMarkers:[]};function m2({game:i,daylight:e,minimap:t}){const r=d_(i);return se.jsxs("div",{className:"hud-root",children:[se.jsx(x2,{hud:r}),t&&se.jsx(_2,{hud:r}),se.jsxs("div",{className:"hud-left",children:[se.jsx(Hi,{label:"AIRSPEED",value:Math.round(r.speedKt),unit:"KT",big:!0}),se.jsx(Hi,{label:"MACH",value:r.mach.toFixed(2)}),se.jsx(Hi,{label:"AOA",value:r.aoaDeg.toFixed(1),unit:"°",warn:Math.abs(r.aoaDeg)>13}),se.jsx(Hi,{label:"G",value:r.gLoad.toFixed(1),warn:r.gLoad>7.5||r.gLoad<-1}),r.dfActive&&se.jsx(Hi,{label:"HULL",value:r.dfHull,unit:"%",warn:r.dfHull<=30})]}),se.jsxs("div",{className:"hud-right",children:[se.jsx(Hi,{label:"ALT",value:Math.round(r.altFt).toLocaleString(),unit:"FT",big:!0}),se.jsx(Hi,{label:"RALT",value:Math.round(r.radarAltFt).toLocaleString(),unit:"FT",warn:r.radarAltFt<500}),se.jsx(Hi,{label:"V/S",value:(r.vsFpm>0?"+":"")+Math.round(r.vsFpm),unit:"FPM"}),se.jsx(Hi,{label:"HDG",value:String(Math.round(r.headingDeg)).padStart(3,"0"),unit:"°"}),se.jsx(Hi,{label:"W-SWEEP",value:String(r.sweepDeg),unit:"°"})]}),se.jsxs("div",{className:"hud-bottom",children:[se.jsxs("div",{className:"hud-eng",children:[se.jsx(g2,{pct:r.throttlePct,ab:r.ab}),se.jsxs("span",{className:"hud-rpm",children:["RPM ",r.rpmPct,"%"]})]}),se.jsxs("div",{className:"hud-toggles",children:[se.jsx(bc,{on:r.gear,text:"GEAR",warn:!r.gear&&!r.onGround}),se.jsx(bc,{on:r.flaps,text:"FLAPS"}),se.jsx(bc,{on:r.speedbrake,text:"S-BRAKE"}),se.jsx(bc,{on:r.trim>.52||r.trim<.48,text:"TRIM"})]}),se.jsxs("div",{className:"hud-nav",children:[se.jsxs("div",{children:["CARRIER ",r.carrierName," · ",r.distCarrierKm.toFixed(1)," KM · ",Math.round(r.bearingCarrierDeg),"°"]}),se.jsxs("div",{children:["FIELD ",r.distFieldKm.toFixed(1)," KM · ",Math.round(r.bearingFieldDeg),"°"]}),r.dfActive&&se.jsxs("div",{children:["BANDITS ",r.dfBandits," · KILLS ",r.dfKills," · WAVE ",r.dfWave," · NEAREST ",r.dfNearestKm.toFixed(1)," KM ",Math.round(r.dfNearestBrgDeg),"°"]}),se.jsxs("div",{className:"hud-cam",children:[r.cameraMode.toUpperCase()," CAM · C to cycle · ",v2(r.localHour)," ",e==="live"?"HST":"LOCAL"]})]})]}),r.stalled&&se.jsx("div",{className:"hud-stall",children:"STALL"}),r.catPhase==="ready"&&se.jsx("div",{className:"hud-cat ready",children:"HOLD [SPACE] — CATAPULT LAUNCH"}),r.catPhase==="charging"&&se.jsxs("div",{className:"hud-cat charging",children:["CAT TENSION ",Math.round(r.catProgress*100),"%"]}),r.ab>.05&&se.jsx("div",{className:"hud-ab",children:"AB"}),r.banner&&se.jsx("div",{className:"hud-banner",children:r.banner}),r.worldAttribution&&se.jsx("div",{className:"hud-credit",children:r.worldAttribution})]})}function Hi({label:i,value:e,unit:t,big:r,warn:o}){return se.jsxs("div",{className:"hud-gauge"+(r?" big":"")+(o?" warn":""),children:[se.jsx("span",{className:"hud-gauge-label",children:i}),se.jsxs("span",{className:"hud-gauge-value",children:[e,t?se.jsx("em",{children:t}):null]})]})}function g2({pct:i,ab:e}){return se.jsxs("div",{className:"hud-throttle",children:[se.jsx("div",{className:"hud-throttle-fill",style:{width:`${i}%`}}),e>.05&&se.jsx("div",{className:"hud-throttle-ab",style:{width:`${Math.min(100,i*.6)}%`}}),se.jsxs("span",{children:["THR ",i,"%",e>.05?" AB":""]})]})}function bc({on:i,text:e,warn:t}){return se.jsx("span",{className:"hud-tag"+(i?" on":"")+(t?" warn":""),children:e})}function v2(i){const e=Math.floor((i%24+24)%24),t=Math.floor((i-Math.floor(i))*60);return`${String(e).padStart(2,"0")}:${String(t).padStart(2,"0")}`}function _2({hud:i}){const e=_n.useRef(null);return _n.useEffect(()=>{const t=e.current;if(!t)return;const r=176,o=Math.min(window.devicePixelRatio,2);t.width=r*o,t.height=r*o;const a=t.getContext("2d");if(!a)return;let c=4e3;for(const y of i.carrierMarkers)c=Math.max(c,Math.hypot(y.x-i.playerX,y.z-i.playerZ));c=Math.max(c,Math.hypot(i.fieldX-i.playerX,i.fieldZ-i.playerZ));const u=c*1.15,f=(r/2-10)/u,d=y=>r/2+(y-i.playerX)*f,m=y=>r/2+(y-i.playerZ)*f;a.setTransform(o,0,0,o,0,0),a.clearRect(0,0,r,r),a.fillStyle="rgba(6, 22, 34, 0.72)",a.fillRect(0,0,r,r),a.strokeStyle="rgba(120, 200, 255, 0.10)",a.lineWidth=1;for(let y=1;y<4;y++){const _=r/4*y;a.beginPath(),a.moveTo(_,0),a.lineTo(_,r),a.moveTo(0,_),a.lineTo(r,_),a.stroke()}a.strokeStyle="rgba(120, 255, 140, 0.16)";for(const y of[1/3,2/3])a.beginPath(),a.arc(r/2,r/2,(r/2-10)*y,0,Math.PI*2),a.stroke();const g=i.worldExtent;a.strokeStyle="rgba(160, 200, 230, 0.22)",a.setLineDash([4,4]),a.strokeRect(d(-g),m(-g),g*2*f,g*2*f),a.setLineDash([]),a.strokeStyle="rgba(255, 210, 80, 0.95)",a.lineWidth=2;const v=d(i.fieldX),S=m(i.fieldZ),M=1100*f;a.beginPath(),a.moveTo(v-M,S),a.lineTo(v+M,S),a.stroke(),a.fillStyle="rgba(255, 210, 80, 0.95)",a.font="9px ui-monospace, monospace",a.fillText("FIELD",v+M+4,S+3),a.font="9px ui-monospace, monospace";for(const y of i.carrierMarkers){const _=d(y.x),L=m(y.z);_<-20||_>r+20||L<-20||L>r+20||(a.fillStyle=y.near?"rgba(120, 255, 140, 1)":"rgba(150, 200, 230, 0.8)",a.beginPath(),a.arc(_,L,y.near?4:3,0,Math.PI*2),a.fill(),a.fillText(y.name,_+6,L+3))}a.fillStyle="rgba(255, 91, 77, 0.95)";for(const y of i.enemyMarkers){const _=d(y.x),L=m(y.z);_<-10||_>r+10||L<-10||L>r+10||(a.beginPath(),a.arc(_,L,3,0,Math.PI*2),a.fill())}const w=i.playerHeadingDeg*Math.PI/180;a.save(),a.translate(r/2,r/2),a.rotate(w),a.fillStyle="rgba(255, 255, 255, 0.95)",a.beginPath(),a.moveTo(0,-7),a.lineTo(5,5),a.lineTo(0,2.5),a.lineTo(-5,5),a.closePath(),a.fill(),a.restore(),a.strokeStyle="rgba(120, 255, 140, 0.45)",a.lineWidth=1,a.strokeRect(.5,.5,r-1,r-1),a.fillStyle="rgba(120, 255, 140, 0.8)",a.font="9px ui-monospace, monospace",a.fillText("N",r/2-3,11),a.fillText(`${(u/1e3).toFixed(0)}km`,6,r-6)},[i]),se.jsxs("div",{className:"hud-map",children:[se.jsx("canvas",{ref:e,className:"hud-map-canvas"}),se.jsx("span",{className:"hud-map-label",children:i.dayPhase==="night"?"NIGHT":i.dayPhase==="twilight"?"TWILIGHT":i.dayPhase==="golden"?"GOLDEN":"DAY"})]})}function x2({hud:i}){const e=_n.useRef(null);return _n.useEffect(()=>{let t=0;const r=()=>{t=requestAnimationFrame(r);const o=e.current;if(!o)return;const a=Math.min(window.devicePixelRatio,2),c=o.clientWidth,u=o.clientHeight;(o.width!==c*a||o.height!==u*a)&&(o.width=c*a,o.height=u*a);const f=o.getContext("2d");if(!f)return;f.setTransform(a,0,0,a,0,0),f.clearRect(0,0,c,u);const d=c/2,m=u/2,g=Math.min(7,u/90),v=i.rollDeg*Math.PI/180;f.save(),f.translate(d,m),f.rotate(v),f.strokeStyle="rgba(120,255,140,0.9)",f.fillStyle="rgba(120,255,140,0.9)",f.lineWidth=1.5,f.font="11px monospace";const S=i.pitchDeg*g;f.beginPath(),f.moveTo(-c*.32,S),f.lineTo(-40,S),f.moveTo(40,S),f.lineTo(c*.32,S),f.stroke();for(let y=1;y<=3;y++){const _=S+y*10*g,L=28+y*6;f.beginPath(),f.moveTo(-L,_),f.lineTo(L,_),f.stroke()}for(let y=-90;y<=90;y+=10){if(y===0)continue;const _=S-y*g;if(Math.abs(_)>u*.48)continue;const L=34;f.beginPath(),f.moveTo(-L,_),f.lineTo(-8,_),f.moveTo(8,_),f.lineTo(L,_),f.stroke(),f.fillText(String(y),L+6,_+4),f.fillText(String(y),-L-22,_+4)}f.restore(),f.strokeStyle="rgba(255,220,80,0.95)",f.lineWidth=2,f.beginPath(),f.moveTo(d-26,m),f.lineTo(d-8,m),f.lineTo(d-4,m+6),f.lineTo(d+4,m+6),f.lineTo(d+8,m),f.lineTo(d+26,m),f.stroke();const M=Math.atan2(i.vsFpm/196.85,Math.max(i.speedKt/1.94384,8))*(180/Math.PI),w=m-(i.pitchDeg-M)*g;f.strokeStyle="rgba(120,255,140,0.95)",f.beginPath(),f.arc(d,w,5,0,Math.PI*2),f.stroke(),f.beginPath(),f.moveTo(d-12,w),f.lineTo(d-5,w),f.moveTo(d+5,w),f.lineTo(d+12,w),f.moveTo(d,w-8),f.lineTo(d,w-5),f.stroke()};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[i]),se.jsx("canvas",{ref:e,className:"hud-ladder"})}function y2(i){const e=t=>i?i.subscribePhase(()=>t()):()=>{};return _n.useSyncExternalStore(e,()=>i?i.phase:"menu",()=>"menu")}const ov={status:"ready",id:"archipelago"};function S2(i){const e=t=>i?i.subscribeWorld(()=>t()):()=>{};return _n.useSyncExternalStore(e,()=>i?i.worldStateSnapshot:ov,()=>ov)}function M2({game:i,settings:e,onSettings:t}){const r=y2(i);return se.jsxs(se.Fragment,{children:[r==="menu"&&se.jsx(w2,{game:i,settings:e,onSettings:t}),r!=="menu"&&se.jsx(m2,{game:i,daylight:e.daylight,minimap:e.minimap}),r==="paused"&&i&&se.jsx(E2,{game:i,settings:e,onSettings:t}),r==="result"&&i&&se.jsx(T2,{game:i})]})}function $n({children:i,onClick:e,primary:t}){return se.jsx("button",{className:"menu-btn"+(t?" primary":""),onClick:e,children:i})}function w2({game:i,settings:e,onSettings:t}){const[r,o]=_n.useState("main"),a=S2(i),[c,u]=_n.useState(!1),f=c||a.status==="loading",d=async m=>{if(!i||f||m===a.id)return;u(!0),await i.setWorldKind(m)||t({...e,world:m}),u(!1)};return se.jsxs("div",{className:"ui-root menu-bg",children:[se.jsxs("div",{className:"menu-panel",children:[se.jsxs("div",{className:"menu-title",children:[se.jsx("span",{className:"menu-kicker",children:"VF-84 JOLLY ROGERS"}),se.jsx("h1",{children:"F-14 TOMCAT"}),se.jsx("span",{className:"menu-sub",children:"CARRIER FLIGHT SIMULATOR"})]}),r==="main"&&se.jsxs(se.Fragment,{children:[se.jsxs("div",{className:"menu-buttons",children:[se.jsx($n,{primary:!0,onClick:()=>i==null?void 0:i.startMission("carrier"),children:"CAT SHOT — CARRIER LAUNCH"}),se.jsx($n,{onClick:()=>i==null?void 0:i.startMission("airfield"),children:"RUNWAY — ISLAND AIRFIELD"}),se.jsx($n,{onClick:()=>o("settings"),children:"SETTINGS"}),se.jsx($n,{onClick:()=>o("controls"),children:"CONTROLS"})]}),se.jsxs("div",{className:"menu-world",children:[se.jsx("span",{className:"menu-world-label",children:"WORLD"}),se.jsxs("div",{className:"menu-world-chips",children:[se.jsx("button",{className:"world-chip"+(a.id==="archipelago"?" on":""),disabled:f,onClick:()=>void d("archipelago"),children:"PROCEDURAL ISLANDS"}),se.jsx("button",{className:"world-chip"+(a.id==="kauai"?" on":""),disabled:f,onClick:()=>void d("kauai"),children:"KAUAI · LIVE MAPBOX TERRAIN"})]}),a.status==="loading"&&se.jsx("div",{className:"menu-world-note",children:"Fetching Mapbox terrain & satellite imagery…"}),a.status==="error"&&se.jsx("div",{className:"menu-world-note err",children:a.error}),a.id==="kauai"&&a.status==="ready"&&se.jsx("div",{className:"menu-world-credit",children:"Terrain & imagery © Mapbox © OpenStreetMap"})]})]}),r==="settings"&&se.jsx(p_,{settings:e,onSettings:t,onBack:()=>o("main")}),r==="controls"&&se.jsx(m_,{settings:e,onSettings:t,onBack:()=>o("main")})]}),se.jsx("div",{className:"menu-footer",children:"Mouse drag — look around · C — camera · ESC — pause"})]})}function E2({game:i,settings:e,onSettings:t}){const[r,o]=_n.useState("main");return se.jsx("div",{className:"ui-root pause-bg",children:se.jsxs("div",{className:"menu-panel small",children:[se.jsx("h2",{className:"menu-h2",children:"PAUSED"}),r==="main"&&se.jsxs("div",{className:"menu-buttons",children:[se.jsx($n,{primary:!0,onClick:()=>i.resume(),children:"RESUME"}),se.jsx($n,{onClick:()=>i.restart(),children:"RESTART FLIGHT"}),se.jsx($n,{onClick:()=>o("settings"),children:"SETTINGS"}),se.jsx($n,{onClick:()=>o("controls"),children:"CONTROLS"}),se.jsx($n,{onClick:()=>i.quitToMenu(),children:"QUIT TO MENU"})]}),r==="settings"&&se.jsx(p_,{settings:e,onSettings:t,onBack:()=>o("main")}),r==="controls"&&se.jsx(m_,{settings:e,onSettings:t,onBack:()=>o("main")})]})})}function T2({game:i}){const e=d_(i);if(!e.resultTitle)return null;const t=e.resultKind;return se.jsx("div",{className:"ui-root result-bg "+(t??""),children:se.jsxs("div",{className:"result-panel",children:[se.jsx("h2",{className:"result-title "+(t??""),children:e.resultTitle}),se.jsx("p",{className:"result-detail",children:e.resultDetail}),e.resultKind==="wire"&&se.jsxs("p",{className:"result-sub",children:["Flight time ",e.flightTime.toFixed(0)," s · Wire ",e.wire]}),se.jsxs("div",{className:"menu-buttons",children:[se.jsx($n,{primary:!0,onClick:()=>i.restart(),children:"FLY AGAIN"}),se.jsx($n,{onClick:()=>i.quitToMenu(),children:"QUIT TO MENU"})]}),se.jsx("p",{className:"result-hint",children:"Choose a button, pilot."})]})})}function p_({settings:i,onSettings:e,onBack:t}){const r=o=>e({...i,...o});return se.jsxs("div",{className:"menu-screen",children:[se.jsx("h3",{className:"menu-h3",children:"SETTINGS"}),se.jsxs("label",{className:"menu-row",children:[se.jsx("span",{children:"Graphics quality"}),se.jsxs("select",{value:i.quality,onChange:o=>r({quality:o.target.value}),children:[se.jsx("option",{value:"low",children:"Low"}),se.jsx("option",{value:"medium",children:"Medium"}),se.jsx("option",{value:"high",children:"High"})]})]}),se.jsxs("label",{className:"menu-row",children:[se.jsx("span",{children:"Volume"}),se.jsx("input",{type:"range",min:0,max:1,step:.05,value:i.volume,onChange:o=>r({volume:Number(o.target.value)})})]}),se.jsxs("label",{className:"menu-row",children:[se.jsx("span",{children:"Control sensitivity"}),se.jsx("input",{type:"range",min:.4,max:1.5,step:.05,value:i.sensitivity,onChange:o=>r({sensitivity:Number(o.target.value)})})]}),se.jsxs("label",{className:"menu-row",children:[se.jsx("span",{children:"Game mode"}),se.jsx("select",{value:i.gameMode,onChange:o=>r({gameMode:o.target.value}),children:Object.keys(D0).map(o=>se.jsx("option",{value:o,children:D0[o]},o))})]}),se.jsxs("label",{className:"menu-row",children:[se.jsx("span",{children:"Daylight"}),se.jsx("select",{value:i.daylight,onChange:o=>r({daylight:o.target.value}),children:Object.keys(L0).map(o=>se.jsx("option",{value:o,children:L0[o]},o))})]}),se.jsxs("label",{className:"menu-row",children:[se.jsxs("span",{children:["Time of day",i.daylight==="fixed"?"":" (fixed mode)"]}),se.jsx("input",{type:"range",min:0,max:24,step:.25,disabled:i.daylight!=="fixed",value:i.timeOfDay,onChange:o=>r({timeOfDay:Number(o.target.value)})})]}),se.jsxs("label",{className:"menu-row",children:[se.jsx("span",{children:"Show minimap"}),se.jsx("input",{type:"checkbox",checked:i.minimap,onChange:o=>r({minimap:o.target.checked})})]}),se.jsx("p",{className:"menu-note",children:"Time of day drives the sun, sky and fog. Real time follows Hawaii (HST). Dogfight mode spawns AI bandits — fire guns with Q."}),se.jsx($n,{onClick:t,children:"BACK"})]})}function m_({settings:i,onSettings:e,onBack:t}){const[r,o]=_n.useState(null);_n.useEffect(()=>{if(!r)return;const c=u=>{u.preventDefault(),u.code!=="Escape"&&e({...i,bindings:{...i.bindings,[r]:u.code}}),o(null)};return window.addEventListener("keydown",c,{once:!0}),()=>window.removeEventListener("keydown",c)},[r,i,e]);const a=Object.keys(b0);return se.jsxs("div",{className:"menu-screen",children:[se.jsx("h3",{className:"menu-h3",children:"CONTROLS"}),se.jsx("div",{className:"bindings-grid",children:a.map(c=>se.jsxs("button",{className:"binding"+(r===c?" capturing":""),onClick:()=>o(c),children:[se.jsx("span",{children:b0[c]}),se.jsx("kbd",{children:r===c?"press a key…":vA(i.bindings[c])})]},c))}),se.jsx("p",{className:"menu-note",children:"Mouse: drag to look around (chase camera · C cycles chase / cockpit / action)."}),se.jsxs("div",{className:"menu-row-btns",children:[se.jsx($n,{onClick:()=>e({...i,bindings:{...n_}}),children:"RESET DEFAULTS"}),se.jsx($n,{onClick:t,children:"BACK"})]})]})}function A2(){const i=_n.useRef(null),[e,t]=_n.useState(null),[r,o]=_n.useState(()=>gA());_n.useEffect(()=>{if(!i.current)return;const c=new d2(i.current,r);t(c);let u=!1;return r.world!=="archipelago"&&c.setWorldKind(r.world).then(f=>{u||!f||o(d=>{const m={...d,world:"archipelago"};return I0(m),m})}),()=>{u=!0,c.dispose()}},[]);const a=c=>{o(c),I0(c),e==null||e.applySettings(c)};return se.jsxs("div",{className:"app",children:[se.jsx("canvas",{ref:i,className:"game-canvas"}),se.jsx(M2,{game:e,settings:r,onSettings:a})]})}ry.createRoot(document.getElementById("root")).render(se.jsx(_n.StrictMode,{children:se.jsx(A2,{})}));
