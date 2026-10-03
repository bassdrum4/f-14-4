var ex=Object.defineProperty;var tx=(i,e,t)=>e in i?ex(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var Le=(i,e,t)=>tx(i,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(o){if(o.ep)return;o.ep=!0;const l=t(o);fetch(o.href,l)}})();var nf={exports:{}},ra={},rf={exports:{}},xt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Im;function nx(){if(Im)return xt;Im=1;var i=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),c=Symbol.for("react.context"),f=Symbol.for("react.forward_ref"),h=Symbol.for("react.suspense"),d=Symbol.for("react.memo"),m=Symbol.for("react.lazy"),_=Symbol.iterator;function g(k){return k===null||typeof k!="object"?null:(k=_&&k[_]||k["@@iterator"],typeof k=="function"?k:null)}var y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,E={};function S(k,ee,Fe){this.props=k,this.context=ee,this.refs=E,this.updater=Fe||y}S.prototype.isReactComponent={},S.prototype.setState=function(k,ee){if(typeof k!="object"&&typeof k!="function"&&k!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,k,ee,"setState")},S.prototype.forceUpdate=function(k){this.updater.enqueueForceUpdate(this,k,"forceUpdate")};function v(){}v.prototype=S.prototype;function L(k,ee,Fe){this.props=k,this.context=ee,this.refs=E,this.updater=Fe||y}var R=L.prototype=new v;R.constructor=L,M(R,S.prototype),R.isPureReactComponent=!0;var T=Array.isArray,B=Object.prototype.hasOwnProperty,I={current:null},O={key:!0,ref:!0,__self:!0,__source:!0};function z(k,ee,Fe){var J,he={},Me=null,de=null;if(ee!=null)for(J in ee.ref!==void 0&&(de=ee.ref),ee.key!==void 0&&(Me=""+ee.key),ee)B.call(ee,J)&&!O.hasOwnProperty(J)&&(he[J]=ee[J]);var Pe=arguments.length-2;if(Pe===1)he.children=Fe;else if(1<Pe){for(var He=Array(Pe),Ze=0;Ze<Pe;Ze++)He[Ze]=arguments[Ze+2];he.children=He}if(k&&k.defaultProps)for(J in Pe=k.defaultProps,Pe)he[J]===void 0&&(he[J]=Pe[J]);return{$$typeof:i,type:k,key:Me,ref:de,props:he,_owner:I.current}}function P(k,ee){return{$$typeof:i,type:k.type,key:ee,ref:k.ref,props:k.props,_owner:k._owner}}function A(k){return typeof k=="object"&&k!==null&&k.$$typeof===i}function U(k){var ee={"=":"=0",":":"=2"};return"$"+k.replace(/[=:]/g,function(Fe){return ee[Fe]})}var Q=/\/+/g;function Y(k,ee){return typeof k=="object"&&k!==null&&k.key!=null?U(""+k.key):ee.toString(36)}function ie(k,ee,Fe,J,he){var Me=typeof k;(Me==="undefined"||Me==="boolean")&&(k=null);var de=!1;if(k===null)de=!0;else switch(Me){case"string":case"number":de=!0;break;case"object":switch(k.$$typeof){case i:case e:de=!0}}if(de)return de=k,he=he(de),k=J===""?"."+Y(de,0):J,T(he)?(Fe="",k!=null&&(Fe=k.replace(Q,"$&/")+"/"),ie(he,ee,Fe,"",function(Ze){return Ze})):he!=null&&(A(he)&&(he=P(he,Fe+(!he.key||de&&de.key===he.key?"":(""+he.key).replace(Q,"$&/")+"/")+k)),ee.push(he)),1;if(de=0,J=J===""?".":J+":",T(k))for(var Pe=0;Pe<k.length;Pe++){Me=k[Pe];var He=J+Y(Me,Pe);de+=ie(Me,ee,Fe,He,he)}else if(He=g(k),typeof He=="function")for(k=He.call(k),Pe=0;!(Me=k.next()).done;)Me=Me.value,He=J+Y(Me,Pe++),de+=ie(Me,ee,Fe,He,he);else if(Me==="object")throw ee=String(k),Error("Objects are not valid as a React child (found: "+(ee==="[object Object]"?"object with keys {"+Object.keys(k).join(", ")+"}":ee)+"). If you meant to render a collection of children, use an array instead.");return de}function le(k,ee,Fe){if(k==null)return k;var J=[],he=0;return ie(k,J,"","",function(Me){return ee.call(Fe,Me,he++)}),J}function se(k){if(k._status===-1){var ee=k._result;ee=ee(),ee.then(function(Fe){(k._status===0||k._status===-1)&&(k._status=1,k._result=Fe)},function(Fe){(k._status===0||k._status===-1)&&(k._status=2,k._result=Fe)}),k._status===-1&&(k._status=0,k._result=ee)}if(k._status===1)return k._result.default;throw k._result}var ce={current:null},V={transition:null},ue={ReactCurrentDispatcher:ce,ReactCurrentBatchConfig:V,ReactCurrentOwner:I};function oe(){throw Error("act(...) is not supported in production builds of React.")}return xt.Children={map:le,forEach:function(k,ee,Fe){le(k,function(){ee.apply(this,arguments)},Fe)},count:function(k){var ee=0;return le(k,function(){ee++}),ee},toArray:function(k){return le(k,function(ee){return ee})||[]},only:function(k){if(!A(k))throw Error("React.Children.only expected to receive a single React element child.");return k}},xt.Component=S,xt.Fragment=t,xt.Profiler=o,xt.PureComponent=L,xt.StrictMode=s,xt.Suspense=h,xt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ue,xt.act=oe,xt.cloneElement=function(k,ee,Fe){if(k==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+k+".");var J=M({},k.props),he=k.key,Me=k.ref,de=k._owner;if(ee!=null){if(ee.ref!==void 0&&(Me=ee.ref,de=I.current),ee.key!==void 0&&(he=""+ee.key),k.type&&k.type.defaultProps)var Pe=k.type.defaultProps;for(He in ee)B.call(ee,He)&&!O.hasOwnProperty(He)&&(J[He]=ee[He]===void 0&&Pe!==void 0?Pe[He]:ee[He])}var He=arguments.length-2;if(He===1)J.children=Fe;else if(1<He){Pe=Array(He);for(var Ze=0;Ze<He;Ze++)Pe[Ze]=arguments[Ze+2];J.children=Pe}return{$$typeof:i,type:k.type,key:he,ref:Me,props:J,_owner:de}},xt.createContext=function(k){return k={$$typeof:c,_currentValue:k,_currentValue2:k,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},k.Provider={$$typeof:l,_context:k},k.Consumer=k},xt.createElement=z,xt.createFactory=function(k){var ee=z.bind(null,k);return ee.type=k,ee},xt.createRef=function(){return{current:null}},xt.forwardRef=function(k){return{$$typeof:f,render:k}},xt.isValidElement=A,xt.lazy=function(k){return{$$typeof:m,_payload:{_status:-1,_result:k},_init:se}},xt.memo=function(k,ee){return{$$typeof:d,type:k,compare:ee===void 0?null:ee}},xt.startTransition=function(k){var ee=V.transition;V.transition={};try{k()}finally{V.transition=ee}},xt.unstable_act=oe,xt.useCallback=function(k,ee){return ce.current.useCallback(k,ee)},xt.useContext=function(k){return ce.current.useContext(k)},xt.useDebugValue=function(){},xt.useDeferredValue=function(k){return ce.current.useDeferredValue(k)},xt.useEffect=function(k,ee){return ce.current.useEffect(k,ee)},xt.useId=function(){return ce.current.useId()},xt.useImperativeHandle=function(k,ee,Fe){return ce.current.useImperativeHandle(k,ee,Fe)},xt.useInsertionEffect=function(k,ee){return ce.current.useInsertionEffect(k,ee)},xt.useLayoutEffect=function(k,ee){return ce.current.useLayoutEffect(k,ee)},xt.useMemo=function(k,ee){return ce.current.useMemo(k,ee)},xt.useReducer=function(k,ee,Fe){return ce.current.useReducer(k,ee,Fe)},xt.useRef=function(k){return ce.current.useRef(k)},xt.useState=function(k){return ce.current.useState(k)},xt.useSyncExternalStore=function(k,ee,Fe){return ce.current.useSyncExternalStore(k,ee,Fe)},xt.useTransition=function(){return ce.current.useTransition()},xt.version="18.3.1",xt}var Um;function Xh(){return Um||(Um=1,rf.exports=nx()),rf.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Fm;function ix(){if(Fm)return ra;Fm=1;var i=Xh(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),s=Object.prototype.hasOwnProperty,o=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function c(f,h,d){var m,_={},g=null,y=null;d!==void 0&&(g=""+d),h.key!==void 0&&(g=""+h.key),h.ref!==void 0&&(y=h.ref);for(m in h)s.call(h,m)&&!l.hasOwnProperty(m)&&(_[m]=h[m]);if(f&&f.defaultProps)for(m in h=f.defaultProps,h)_[m]===void 0&&(_[m]=h[m]);return{$$typeof:e,type:f,key:g,ref:y,props:_,_owner:o.current}}return ra.Fragment=t,ra.jsx=c,ra.jsxs=c,ra}var Om;function rx(){return Om||(Om=1,nf.exports=ix()),nf.exports}var fe=rx(),Ln=Xh(),Il={},sf={exports:{}},Vn={},of={exports:{}},af={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var km;function sx(){return km||(km=1,(function(i){function e(V,ue){var oe=V.length;V.push(ue);e:for(;0<oe;){var k=oe-1>>>1,ee=V[k];if(0<o(ee,ue))V[k]=ue,V[oe]=ee,oe=k;else break e}}function t(V){return V.length===0?null:V[0]}function s(V){if(V.length===0)return null;var ue=V[0],oe=V.pop();if(oe!==ue){V[0]=oe;e:for(var k=0,ee=V.length,Fe=ee>>>1;k<Fe;){var J=2*(k+1)-1,he=V[J],Me=J+1,de=V[Me];if(0>o(he,oe))Me<ee&&0>o(de,he)?(V[k]=de,V[Me]=oe,k=Me):(V[k]=he,V[J]=oe,k=J);else if(Me<ee&&0>o(de,oe))V[k]=de,V[Me]=oe,k=Me;else break e}}return ue}function o(V,ue){var oe=V.sortIndex-ue.sortIndex;return oe!==0?oe:V.id-ue.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;i.unstable_now=function(){return l.now()}}else{var c=Date,f=c.now();i.unstable_now=function(){return c.now()-f}}var h=[],d=[],m=1,_=null,g=3,y=!1,M=!1,E=!1,S=typeof setTimeout=="function"?setTimeout:null,v=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function R(V){for(var ue=t(d);ue!==null;){if(ue.callback===null)s(d);else if(ue.startTime<=V)s(d),ue.sortIndex=ue.expirationTime,e(h,ue);else break;ue=t(d)}}function T(V){if(E=!1,R(V),!M)if(t(h)!==null)M=!0,se(B);else{var ue=t(d);ue!==null&&ce(T,ue.startTime-V)}}function B(V,ue){M=!1,E&&(E=!1,v(z),z=-1),y=!0;var oe=g;try{for(R(ue),_=t(h);_!==null&&(!(_.expirationTime>ue)||V&&!U());){var k=_.callback;if(typeof k=="function"){_.callback=null,g=_.priorityLevel;var ee=k(_.expirationTime<=ue);ue=i.unstable_now(),typeof ee=="function"?_.callback=ee:_===t(h)&&s(h),R(ue)}else s(h);_=t(h)}if(_!==null)var Fe=!0;else{var J=t(d);J!==null&&ce(T,J.startTime-ue),Fe=!1}return Fe}finally{_=null,g=oe,y=!1}}var I=!1,O=null,z=-1,P=5,A=-1;function U(){return!(i.unstable_now()-A<P)}function Q(){if(O!==null){var V=i.unstable_now();A=V;var ue=!0;try{ue=O(!0,V)}finally{ue?Y():(I=!1,O=null)}}else I=!1}var Y;if(typeof L=="function")Y=function(){L(Q)};else if(typeof MessageChannel<"u"){var ie=new MessageChannel,le=ie.port2;ie.port1.onmessage=Q,Y=function(){le.postMessage(null)}}else Y=function(){S(Q,0)};function se(V){O=V,I||(I=!0,Y())}function ce(V,ue){z=S(function(){V(i.unstable_now())},ue)}i.unstable_IdlePriority=5,i.unstable_ImmediatePriority=1,i.unstable_LowPriority=4,i.unstable_NormalPriority=3,i.unstable_Profiling=null,i.unstable_UserBlockingPriority=2,i.unstable_cancelCallback=function(V){V.callback=null},i.unstable_continueExecution=function(){M||y||(M=!0,se(B))},i.unstable_forceFrameRate=function(V){0>V||125<V?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):P=0<V?Math.floor(1e3/V):5},i.unstable_getCurrentPriorityLevel=function(){return g},i.unstable_getFirstCallbackNode=function(){return t(h)},i.unstable_next=function(V){switch(g){case 1:case 2:case 3:var ue=3;break;default:ue=g}var oe=g;g=ue;try{return V()}finally{g=oe}},i.unstable_pauseExecution=function(){},i.unstable_requestPaint=function(){},i.unstable_runWithPriority=function(V,ue){switch(V){case 1:case 2:case 3:case 4:case 5:break;default:V=3}var oe=g;g=V;try{return ue()}finally{g=oe}},i.unstable_scheduleCallback=function(V,ue,oe){var k=i.unstable_now();switch(typeof oe=="object"&&oe!==null?(oe=oe.delay,oe=typeof oe=="number"&&0<oe?k+oe:k):oe=k,V){case 1:var ee=-1;break;case 2:ee=250;break;case 5:ee=1073741823;break;case 4:ee=1e4;break;default:ee=5e3}return ee=oe+ee,V={id:m++,callback:ue,priorityLevel:V,startTime:oe,expirationTime:ee,sortIndex:-1},oe>k?(V.sortIndex=oe,e(d,V),t(h)===null&&V===t(d)&&(E?(v(z),z=-1):E=!0,ce(T,oe-k))):(V.sortIndex=ee,e(h,V),M||y||(M=!0,se(B))),V},i.unstable_shouldYield=U,i.unstable_wrapCallback=function(V){var ue=g;return function(){var oe=g;g=ue;try{return V.apply(this,arguments)}finally{g=oe}}}})(af)),af}var zm;function ox(){return zm||(zm=1,of.exports=sx()),of.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Bm;function ax(){if(Bm)return Vn;Bm=1;var i=Xh(),e=ox();function t(n){for(var r="https://reactjs.org/docs/error-decoder.html?invariant="+n,a=1;a<arguments.length;a++)r+="&args[]="+encodeURIComponent(arguments[a]);return"Minified React error #"+n+"; visit "+r+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var s=new Set,o={};function l(n,r){c(n,r),c(n+"Capture",r)}function c(n,r){for(o[n]=r,n=0;n<r.length;n++)s.add(r[n])}var f=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),h=Object.prototype.hasOwnProperty,d=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,m={},_={};function g(n){return h.call(_,n)?!0:h.call(m,n)?!1:d.test(n)?_[n]=!0:(m[n]=!0,!1)}function y(n,r,a,u){if(a!==null&&a.type===0)return!1;switch(typeof r){case"function":case"symbol":return!0;case"boolean":return u?!1:a!==null?!a.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function M(n,r,a,u){if(r===null||typeof r>"u"||y(n,r,a,u))return!0;if(u)return!1;if(a!==null)switch(a.type){case 3:return!r;case 4:return r===!1;case 5:return isNaN(r);case 6:return isNaN(r)||1>r}return!1}function E(n,r,a,u,p,x,w){this.acceptsBooleans=r===2||r===3||r===4,this.attributeName=u,this.attributeNamespace=p,this.mustUseProperty=a,this.propertyName=n,this.type=r,this.sanitizeURL=x,this.removeEmptyString=w}var S={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){S[n]=new E(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var r=n[0];S[r]=new E(r,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){S[n]=new E(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){S[n]=new E(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){S[n]=new E(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){S[n]=new E(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){S[n]=new E(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){S[n]=new E(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){S[n]=new E(n,5,!1,n.toLowerCase(),null,!1,!1)});var v=/[\-:]([a-z])/g;function L(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var r=n.replace(v,L);S[r]=new E(r,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var r=n.replace(v,L);S[r]=new E(r,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var r=n.replace(v,L);S[r]=new E(r,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){S[n]=new E(n,1,!1,n.toLowerCase(),null,!1,!1)}),S.xlinkHref=new E("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){S[n]=new E(n,1,!1,n.toLowerCase(),null,!0,!0)});function R(n,r,a,u){var p=S.hasOwnProperty(r)?S[r]:null;(p!==null?p.type!==0:u||!(2<r.length)||r[0]!=="o"&&r[0]!=="O"||r[1]!=="n"&&r[1]!=="N")&&(M(r,a,p,u)&&(a=null),u||p===null?g(r)&&(a===null?n.removeAttribute(r):n.setAttribute(r,""+a)):p.mustUseProperty?n[p.propertyName]=a===null?p.type===3?!1:"":a:(r=p.attributeName,u=p.attributeNamespace,a===null?n.removeAttribute(r):(p=p.type,a=p===3||p===4&&a===!0?"":""+a,u?n.setAttributeNS(u,r,a):n.setAttribute(r,a))))}var T=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,B=Symbol.for("react.element"),I=Symbol.for("react.portal"),O=Symbol.for("react.fragment"),z=Symbol.for("react.strict_mode"),P=Symbol.for("react.profiler"),A=Symbol.for("react.provider"),U=Symbol.for("react.context"),Q=Symbol.for("react.forward_ref"),Y=Symbol.for("react.suspense"),ie=Symbol.for("react.suspense_list"),le=Symbol.for("react.memo"),se=Symbol.for("react.lazy"),ce=Symbol.for("react.offscreen"),V=Symbol.iterator;function ue(n){return n===null||typeof n!="object"?null:(n=V&&n[V]||n["@@iterator"],typeof n=="function"?n:null)}var oe=Object.assign,k;function ee(n){if(k===void 0)try{throw Error()}catch(a){var r=a.stack.trim().match(/\n( *(at )?)/);k=r&&r[1]||""}return`
`+k+n}var Fe=!1;function J(n,r){if(!n||Fe)return"";Fe=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(r)if(r=function(){throw Error()},Object.defineProperty(r.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(r,[])}catch(te){var u=te}Reflect.construct(n,[],r)}else{try{r.call()}catch(te){u=te}n.call(r.prototype)}else{try{throw Error()}catch(te){u=te}n()}}catch(te){if(te&&u&&typeof te.stack=="string"){for(var p=te.stack.split(`
`),x=u.stack.split(`
`),w=p.length-1,N=x.length-1;1<=w&&0<=N&&p[w]!==x[N];)N--;for(;1<=w&&0<=N;w--,N--)if(p[w]!==x[N]){if(w!==1||N!==1)do if(w--,N--,0>N||p[w]!==x[N]){var H=`
`+p[w].replace(" at new "," at ");return n.displayName&&H.includes("<anonymous>")&&(H=H.replace("<anonymous>",n.displayName)),H}while(1<=w&&0<=N);break}}}finally{Fe=!1,Error.prepareStackTrace=a}return(n=n?n.displayName||n.name:"")?ee(n):""}function he(n){switch(n.tag){case 5:return ee(n.type);case 16:return ee("Lazy");case 13:return ee("Suspense");case 19:return ee("SuspenseList");case 0:case 2:case 15:return n=J(n.type,!1),n;case 11:return n=J(n.type.render,!1),n;case 1:return n=J(n.type,!0),n;default:return""}}function Me(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case O:return"Fragment";case I:return"Portal";case P:return"Profiler";case z:return"StrictMode";case Y:return"Suspense";case ie:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case U:return(n.displayName||"Context")+".Consumer";case A:return(n._context.displayName||"Context")+".Provider";case Q:var r=n.render;return n=n.displayName,n||(n=r.displayName||r.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case le:return r=n.displayName||null,r!==null?r:Me(n.type)||"Memo";case se:r=n._payload,n=n._init;try{return Me(n(r))}catch{}}return null}function de(n){var r=n.type;switch(n.tag){case 24:return"Cache";case 9:return(r.displayName||"Context")+".Consumer";case 10:return(r._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=r.render,n=n.displayName||n.name||"",r.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return r;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Me(r);case 8:return r===z?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof r=="function")return r.displayName||r.name||null;if(typeof r=="string")return r}return null}function Pe(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function He(n){var r=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(r==="checkbox"||r==="radio")}function Ze(n){var r=He(n)?"checked":"value",a=Object.getOwnPropertyDescriptor(n.constructor.prototype,r),u=""+n[r];if(!n.hasOwnProperty(r)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var p=a.get,x=a.set;return Object.defineProperty(n,r,{configurable:!0,get:function(){return p.call(this)},set:function(w){u=""+w,x.call(this,w)}}),Object.defineProperty(n,r,{enumerable:a.enumerable}),{getValue:function(){return u},setValue:function(w){u=""+w},stopTracking:function(){n._valueTracker=null,delete n[r]}}}}function vt(n){n._valueTracker||(n._valueTracker=Ze(n))}function ve(n){if(!n)return!1;var r=n._valueTracker;if(!r)return!0;var a=r.getValue(),u="";return n&&(u=He(n)?n.checked?"true":"false":n.value),n=u,n!==a?(r.setValue(n),!0):!1}function Ae(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function F(n,r){var a=r.checked;return oe({},r,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:a??n._wrapperState.initialChecked})}function Qe(n,r){var a=r.defaultValue==null?"":r.defaultValue,u=r.checked!=null?r.checked:r.defaultChecked;a=Pe(r.value!=null?r.value:a),n._wrapperState={initialChecked:u,initialValue:a,controlled:r.type==="checkbox"||r.type==="radio"?r.checked!=null:r.value!=null}}function Ee(n,r){r=r.checked,r!=null&&R(n,"checked",r,!1)}function Ve(n,r){Ee(n,r);var a=Pe(r.value),u=r.type;if(a!=null)u==="number"?(a===0&&n.value===""||n.value!=a)&&(n.value=""+a):n.value!==""+a&&(n.value=""+a);else if(u==="submit"||u==="reset"){n.removeAttribute("value");return}r.hasOwnProperty("value")?it(n,r.type,a):r.hasOwnProperty("defaultValue")&&it(n,r.type,Pe(r.defaultValue)),r.checked==null&&r.defaultChecked!=null&&(n.defaultChecked=!!r.defaultChecked)}function be(n,r,a){if(r.hasOwnProperty("value")||r.hasOwnProperty("defaultValue")){var u=r.type;if(!(u!=="submit"&&u!=="reset"||r.value!==void 0&&r.value!==null))return;r=""+n._wrapperState.initialValue,a||r===n.value||(n.value=r),n.defaultValue=r}a=n.name,a!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,a!==""&&(n.name=a)}function it(n,r,a){(r!=="number"||Ae(n.ownerDocument)!==n)&&(a==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+a&&(n.defaultValue=""+a))}var Oe=Array.isArray;function D(n,r,a,u){if(n=n.options,r){r={};for(var p=0;p<a.length;p++)r["$"+a[p]]=!0;for(a=0;a<n.length;a++)p=r.hasOwnProperty("$"+n[a].value),n[a].selected!==p&&(n[a].selected=p),p&&u&&(n[a].defaultSelected=!0)}else{for(a=""+Pe(a),r=null,p=0;p<n.length;p++){if(n[p].value===a){n[p].selected=!0,u&&(n[p].defaultSelected=!0);return}r!==null||n[p].disabled||(r=n[p])}r!==null&&(r.selected=!0)}}function C(n,r){if(r.dangerouslySetInnerHTML!=null)throw Error(t(91));return oe({},r,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function $(n,r){var a=r.value;if(a==null){if(a=r.children,r=r.defaultValue,a!=null){if(r!=null)throw Error(t(92));if(Oe(a)){if(1<a.length)throw Error(t(93));a=a[0]}r=a}r==null&&(r=""),a=r}n._wrapperState={initialValue:Pe(a)}}function pe(n,r){var a=Pe(r.value),u=Pe(r.defaultValue);a!=null&&(a=""+a,a!==n.value&&(n.value=a),r.defaultValue==null&&n.defaultValue!==a&&(n.defaultValue=a)),u!=null&&(n.defaultValue=""+u)}function _e(n){var r=n.textContent;r===n._wrapperState.initialValue&&r!==""&&r!==null&&(n.value=r)}function me(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Ye(n,r){return n==null||n==="http://www.w3.org/1999/xhtml"?me(r):n==="http://www.w3.org/2000/svg"&&r==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var De,Ge=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(r,a,u,p){MSApp.execUnsafeLocalFunction(function(){return n(r,a,u,p)})}:n})(function(n,r){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=r;else{for(De=De||document.createElement("div"),De.innerHTML="<svg>"+r.valueOf().toString()+"</svg>",r=De.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;r.firstChild;)n.appendChild(r.firstChild)}});function dt(n,r){if(r){var a=n.firstChild;if(a&&a===n.lastChild&&a.nodeType===3){a.nodeValue=r;return}}n.textContent=r}var we={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Xe=["Webkit","ms","Moz","O"];Object.keys(we).forEach(function(n){Xe.forEach(function(r){r=r+n.charAt(0).toUpperCase()+n.substring(1),we[r]=we[n]})});function ot(n,r,a){return r==null||typeof r=="boolean"||r===""?"":a||typeof r!="number"||r===0||we.hasOwnProperty(n)&&we[n]?(""+r).trim():r+"px"}function at(n,r){n=n.style;for(var a in r)if(r.hasOwnProperty(a)){var u=a.indexOf("--")===0,p=ot(a,r[a],u);a==="float"&&(a="cssFloat"),u?n.setProperty(a,p):n[a]=p}}var je=oe({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function _t(n,r){if(r){if(je[n]&&(r.children!=null||r.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(r.dangerouslySetInnerHTML!=null){if(r.children!=null)throw Error(t(60));if(typeof r.dangerouslySetInnerHTML!="object"||!("__html"in r.dangerouslySetInnerHTML))throw Error(t(61))}if(r.style!=null&&typeof r.style!="object")throw Error(t(62))}}function ft(n,r){if(n.indexOf("-")===-1)return typeof r.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var bt=null;function X(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Ne=null,ae=null,ge=null;function ke(n){if(n=Go(n)){if(typeof Ne!="function")throw Error(t(280));var r=n.stateNode;r&&(r=Ka(r),Ne(n.stateNode,n.type,r))}}function Ue(n){ae?ge?ge.push(n):ge=[n]:ae=n}function ht(){if(ae){var n=ae,r=ge;if(ge=ae=null,ke(n),r)for(n=0;n<r.length;n++)ke(r[n])}}function Ft(n,r){return n(r)}function $t(){}var Et=!1;function Un(n,r,a){if(Et)return n(r,a);Et=!0;try{return Ft(n,r,a)}finally{Et=!1,(ae!==null||ge!==null)&&($t(),ht())}}function En(n,r){var a=n.stateNode;if(a===null)return null;var u=Ka(a);if(u===null)return null;a=u[r];e:switch(r){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(u=!u.disabled)||(n=n.type,u=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!u;break e;default:n=!1}if(n)return null;if(a&&typeof a!="function")throw Error(t(231,r,typeof a));return a}var Ss=!1;if(f)try{var fr={};Object.defineProperty(fr,"passive",{get:function(){Ss=!0}}),window.addEventListener("test",fr,fr),window.removeEventListener("test",fr,fr)}catch{Ss=!1}function Hi(n,r,a,u,p,x,w,N,H){var te=Array.prototype.slice.call(arguments,3);try{r.apply(a,te)}catch(ye){this.onError(ye)}}var Vi=!1,Xr=null,jr=!1,hr=null,Pa={onError:function(n){Vi=!0,Xr=n}};function Ms(n,r,a,u,p,x,w,N,H){Vi=!1,Xr=null,Hi.apply(Pa,arguments)}function ba(n,r,a,u,p,x,w,N,H){if(Ms.apply(this,arguments),Vi){if(Vi){var te=Xr;Vi=!1,Xr=null}else throw Error(t(198));jr||(jr=!0,hr=te)}}function Ri(n){var r=n,a=n;if(n.alternate)for(;r.return;)r=r.return;else{n=r;do r=n,(r.flags&4098)!==0&&(a=r.return),n=r.return;while(n)}return r.tag===3?a:null}function La(n){if(n.tag===13){var r=n.memoizedState;if(r===null&&(n=n.alternate,n!==null&&(r=n.memoizedState)),r!==null)return r.dehydrated}return null}function Da(n){if(Ri(n)!==n)throw Error(t(188))}function wc(n){var r=n.alternate;if(!r){if(r=Ri(n),r===null)throw Error(t(188));return r!==n?null:n}for(var a=n,u=r;;){var p=a.return;if(p===null)break;var x=p.alternate;if(x===null){if(u=p.return,u!==null){a=u;continue}break}if(p.child===x.child){for(x=p.child;x;){if(x===a)return Da(p),n;if(x===u)return Da(p),r;x=x.sibling}throw Error(t(188))}if(a.return!==u.return)a=p,u=x;else{for(var w=!1,N=p.child;N;){if(N===a){w=!0,a=p,u=x;break}if(N===u){w=!0,u=p,a=x;break}N=N.sibling}if(!w){for(N=x.child;N;){if(N===a){w=!0,a=x,u=p;break}if(N===u){w=!0,u=x,a=p;break}N=N.sibling}if(!w)throw Error(t(189))}}if(a.alternate!==u)throw Error(t(190))}if(a.tag!==3)throw Error(t(188));return a.stateNode.current===a?n:r}function b(n){return n=wc(n),n!==null?j(n):null}function j(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var r=j(n);if(r!==null)return r;n=n.sibling}return null}var ne=e.unstable_scheduleCallback,re=e.unstable_cancelCallback,q=e.unstable_shouldYield,Re=e.unstable_requestPaint,Te=e.unstable_now,Je=e.unstable_getCurrentPriorityLevel,Ke=e.unstable_ImmediatePriority,lt=e.unstable_UserBlockingPriority,ut=e.unstable_NormalPriority,et=e.unstable_LowPriority,St=e.unstable_IdlePriority,Pt=null,yt=null;function pn(n){if(yt&&typeof yt.onCommitFiberRoot=="function")try{yt.onCommitFiberRoot(Pt,n,void 0,(n.current.flags&128)===128)}catch{}}var pt=Math.clz32?Math.clz32:Ct,nt=Math.log,ui=Math.LN2;function Ct(n){return n>>>=0,n===0?32:31-(nt(n)/ui|0)|0}var mn=64,fi=4194304;function Zt(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Pi(n,r){var a=n.pendingLanes;if(a===0)return 0;var u=0,p=n.suspendedLanes,x=n.pingedLanes,w=a&268435455;if(w!==0){var N=w&~p;N!==0?u=Zt(N):(x&=w,x!==0&&(u=Zt(x)))}else w=a&~p,w!==0?u=Zt(w):x!==0&&(u=Zt(x));if(u===0)return 0;if(r!==0&&r!==u&&(r&p)===0&&(p=u&-u,x=r&-r,p>=x||p===16&&(x&4194240)!==0))return r;if((u&4)!==0&&(u|=a&16),r=n.entangledLanes,r!==0)for(n=n.entanglements,r&=u;0<r;)a=31-pt(r),p=1<<a,u|=n[a],r&=~p;return u}function It(n,r){switch(n){case 1:case 2:case 4:return r+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return r+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Qn(n,r){for(var a=n.suspendedLanes,u=n.pingedLanes,p=n.expirationTimes,x=n.pendingLanes;0<x;){var w=31-pt(x),N=1<<w,H=p[w];H===-1?((N&a)===0||(N&u)!==0)&&(p[w]=It(N,r)):H<=r&&(n.expiredLanes|=N),x&=~N}}function Gi(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function wn(){var n=mn;return mn<<=1,(mn&4194240)===0&&(mn=64),n}function Jn(n){for(var r=[],a=0;31>a;a++)r.push(n);return r}function Fn(n,r,a){n.pendingLanes|=r,r!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,r=31-pt(r),n[r]=a}function Na(n,r){var a=n.pendingLanes&~r;n.pendingLanes=r,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=r,n.mutableReadLanes&=r,n.entangledLanes&=r,r=n.entanglements;var u=n.eventTimes;for(n=n.expirationTimes;0<a;){var p=31-pt(a),x=1<<p;r[p]=0,u[p]=-1,n[p]=-1,a&=~x}}function Tc(n,r){var a=n.entangledLanes|=r;for(n=n.entanglements;a;){var u=31-pt(a),p=1<<u;p&r|n[u]&r&&(n[u]|=r),a&=~p}}var Lt=0;function hd(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var dd,Ac,pd,md,gd,Cc=!1,Ia=[],dr=null,pr=null,mr=null,Co=new Map,Ro=new Map,gr=[],Mv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function vd(n,r){switch(n){case"focusin":case"focusout":dr=null;break;case"dragenter":case"dragleave":pr=null;break;case"mouseover":case"mouseout":mr=null;break;case"pointerover":case"pointerout":Co.delete(r.pointerId);break;case"gotpointercapture":case"lostpointercapture":Ro.delete(r.pointerId)}}function Po(n,r,a,u,p,x){return n===null||n.nativeEvent!==x?(n={blockedOn:r,domEventName:a,eventSystemFlags:u,nativeEvent:x,targetContainers:[p]},r!==null&&(r=Go(r),r!==null&&Ac(r)),n):(n.eventSystemFlags|=u,r=n.targetContainers,p!==null&&r.indexOf(p)===-1&&r.push(p),n)}function Ev(n,r,a,u,p){switch(r){case"focusin":return dr=Po(dr,n,r,a,u,p),!0;case"dragenter":return pr=Po(pr,n,r,a,u,p),!0;case"mouseover":return mr=Po(mr,n,r,a,u,p),!0;case"pointerover":var x=p.pointerId;return Co.set(x,Po(Co.get(x)||null,n,r,a,u,p)),!0;case"gotpointercapture":return x=p.pointerId,Ro.set(x,Po(Ro.get(x)||null,n,r,a,u,p)),!0}return!1}function _d(n){var r=qr(n.target);if(r!==null){var a=Ri(r);if(a!==null){if(r=a.tag,r===13){if(r=La(a),r!==null){n.blockedOn=r,gd(n.priority,function(){pd(a)});return}}else if(r===3&&a.stateNode.current.memoizedState.isDehydrated){n.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Ua(n){if(n.blockedOn!==null)return!1;for(var r=n.targetContainers;0<r.length;){var a=Pc(n.domEventName,n.eventSystemFlags,r[0],n.nativeEvent);if(a===null){a=n.nativeEvent;var u=new a.constructor(a.type,a);bt=u,a.target.dispatchEvent(u),bt=null}else return r=Go(a),r!==null&&Ac(r),n.blockedOn=a,!1;r.shift()}return!0}function xd(n,r,a){Ua(n)&&a.delete(r)}function wv(){Cc=!1,dr!==null&&Ua(dr)&&(dr=null),pr!==null&&Ua(pr)&&(pr=null),mr!==null&&Ua(mr)&&(mr=null),Co.forEach(xd),Ro.forEach(xd)}function bo(n,r){n.blockedOn===r&&(n.blockedOn=null,Cc||(Cc=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,wv)))}function Lo(n){function r(p){return bo(p,n)}if(0<Ia.length){bo(Ia[0],n);for(var a=1;a<Ia.length;a++){var u=Ia[a];u.blockedOn===n&&(u.blockedOn=null)}}for(dr!==null&&bo(dr,n),pr!==null&&bo(pr,n),mr!==null&&bo(mr,n),Co.forEach(r),Ro.forEach(r),a=0;a<gr.length;a++)u=gr[a],u.blockedOn===n&&(u.blockedOn=null);for(;0<gr.length&&(a=gr[0],a.blockedOn===null);)_d(a),a.blockedOn===null&&gr.shift()}var Es=T.ReactCurrentBatchConfig,Fa=!0;function Tv(n,r,a,u){var p=Lt,x=Es.transition;Es.transition=null;try{Lt=1,Rc(n,r,a,u)}finally{Lt=p,Es.transition=x}}function Av(n,r,a,u){var p=Lt,x=Es.transition;Es.transition=null;try{Lt=4,Rc(n,r,a,u)}finally{Lt=p,Es.transition=x}}function Rc(n,r,a,u){if(Fa){var p=Pc(n,r,a,u);if(p===null)jc(n,r,u,Oa,a),vd(n,u);else if(Ev(p,n,r,a,u))u.stopPropagation();else if(vd(n,u),r&4&&-1<Mv.indexOf(n)){for(;p!==null;){var x=Go(p);if(x!==null&&dd(x),x=Pc(n,r,a,u),x===null&&jc(n,r,u,Oa,a),x===p)break;p=x}p!==null&&u.stopPropagation()}else jc(n,r,u,null,a)}}var Oa=null;function Pc(n,r,a,u){if(Oa=null,n=X(u),n=qr(n),n!==null)if(r=Ri(n),r===null)n=null;else if(a=r.tag,a===13){if(n=La(r),n!==null)return n;n=null}else if(a===3){if(r.stateNode.current.memoizedState.isDehydrated)return r.tag===3?r.stateNode.containerInfo:null;n=null}else r!==n&&(n=null);return Oa=n,null}function yd(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Je()){case Ke:return 1;case lt:return 4;case ut:case et:return 16;case St:return 536870912;default:return 16}default:return 16}}var vr=null,bc=null,ka=null;function Sd(){if(ka)return ka;var n,r=bc,a=r.length,u,p="value"in vr?vr.value:vr.textContent,x=p.length;for(n=0;n<a&&r[n]===p[n];n++);var w=a-n;for(u=1;u<=w&&r[a-u]===p[x-u];u++);return ka=p.slice(n,1<u?1-u:void 0)}function za(n){var r=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&r===13&&(n=13)):n=r,n===10&&(n=13),32<=n||n===13?n:0}function Ba(){return!0}function Md(){return!1}function jn(n){function r(a,u,p,x,w){this._reactName=a,this._targetInst=p,this.type=u,this.nativeEvent=x,this.target=w,this.currentTarget=null;for(var N in n)n.hasOwnProperty(N)&&(a=n[N],this[N]=a?a(x):x[N]);return this.isDefaultPrevented=(x.defaultPrevented!=null?x.defaultPrevented:x.returnValue===!1)?Ba:Md,this.isPropagationStopped=Md,this}return oe(r.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Ba)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Ba)},persist:function(){},isPersistent:Ba}),r}var ws={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Lc=jn(ws),Do=oe({},ws,{view:0,detail:0}),Cv=jn(Do),Dc,Nc,No,Ha=oe({},Do,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Uc,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==No&&(No&&n.type==="mousemove"?(Dc=n.screenX-No.screenX,Nc=n.screenY-No.screenY):Nc=Dc=0,No=n),Dc)},movementY:function(n){return"movementY"in n?n.movementY:Nc}}),Ed=jn(Ha),Rv=oe({},Ha,{dataTransfer:0}),Pv=jn(Rv),bv=oe({},Do,{relatedTarget:0}),Ic=jn(bv),Lv=oe({},ws,{animationName:0,elapsedTime:0,pseudoElement:0}),Dv=jn(Lv),Nv=oe({},ws,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),Iv=jn(Nv),Uv=oe({},ws,{data:0}),wd=jn(Uv),Fv={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Ov={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},kv={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function zv(n){var r=this.nativeEvent;return r.getModifierState?r.getModifierState(n):(n=kv[n])?!!r[n]:!1}function Uc(){return zv}var Bv=oe({},Do,{key:function(n){if(n.key){var r=Fv[n.key]||n.key;if(r!=="Unidentified")return r}return n.type==="keypress"?(n=za(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?Ov[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Uc,charCode:function(n){return n.type==="keypress"?za(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?za(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),Hv=jn(Bv),Vv=oe({},Ha,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Td=jn(Vv),Gv=oe({},Do,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Uc}),Wv=jn(Gv),Xv=oe({},ws,{propertyName:0,elapsedTime:0,pseudoElement:0}),jv=jn(Xv),qv=oe({},Ha,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),Yv=jn(qv),Kv=[9,13,27,32],Fc=f&&"CompositionEvent"in window,Io=null;f&&"documentMode"in document&&(Io=document.documentMode);var $v=f&&"TextEvent"in window&&!Io,Ad=f&&(!Fc||Io&&8<Io&&11>=Io),Cd=" ",Rd=!1;function Pd(n,r){switch(n){case"keyup":return Kv.indexOf(r.keyCode)!==-1;case"keydown":return r.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function bd(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var Ts=!1;function Zv(n,r){switch(n){case"compositionend":return bd(r);case"keypress":return r.which!==32?null:(Rd=!0,Cd);case"textInput":return n=r.data,n===Cd&&Rd?null:n;default:return null}}function Qv(n,r){if(Ts)return n==="compositionend"||!Fc&&Pd(n,r)?(n=Sd(),ka=bc=vr=null,Ts=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(r.ctrlKey||r.altKey||r.metaKey)||r.ctrlKey&&r.altKey){if(r.char&&1<r.char.length)return r.char;if(r.which)return String.fromCharCode(r.which)}return null;case"compositionend":return Ad&&r.locale!=="ko"?null:r.data;default:return null}}var Jv={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Ld(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r==="input"?!!Jv[n.type]:r==="textarea"}function Dd(n,r,a,u){Ue(u),r=ja(r,"onChange"),0<r.length&&(a=new Lc("onChange","change",null,a,u),n.push({event:a,listeners:r}))}var Uo=null,Fo=null;function e_(n){$d(n,0)}function Va(n){var r=bs(n);if(ve(r))return n}function t_(n,r){if(n==="change")return r}var Nd=!1;if(f){var Oc;if(f){var kc="oninput"in document;if(!kc){var Id=document.createElement("div");Id.setAttribute("oninput","return;"),kc=typeof Id.oninput=="function"}Oc=kc}else Oc=!1;Nd=Oc&&(!document.documentMode||9<document.documentMode)}function Ud(){Uo&&(Uo.detachEvent("onpropertychange",Fd),Fo=Uo=null)}function Fd(n){if(n.propertyName==="value"&&Va(Fo)){var r=[];Dd(r,Fo,n,X(n)),Un(e_,r)}}function n_(n,r,a){n==="focusin"?(Ud(),Uo=r,Fo=a,Uo.attachEvent("onpropertychange",Fd)):n==="focusout"&&Ud()}function i_(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return Va(Fo)}function r_(n,r){if(n==="click")return Va(r)}function s_(n,r){if(n==="input"||n==="change")return Va(r)}function o_(n,r){return n===r&&(n!==0||1/n===1/r)||n!==n&&r!==r}var hi=typeof Object.is=="function"?Object.is:o_;function Oo(n,r){if(hi(n,r))return!0;if(typeof n!="object"||n===null||typeof r!="object"||r===null)return!1;var a=Object.keys(n),u=Object.keys(r);if(a.length!==u.length)return!1;for(u=0;u<a.length;u++){var p=a[u];if(!h.call(r,p)||!hi(n[p],r[p]))return!1}return!0}function Od(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function kd(n,r){var a=Od(n);n=0;for(var u;a;){if(a.nodeType===3){if(u=n+a.textContent.length,n<=r&&u>=r)return{node:a,offset:r-n};n=u}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Od(a)}}function zd(n,r){return n&&r?n===r?!0:n&&n.nodeType===3?!1:r&&r.nodeType===3?zd(n,r.parentNode):"contains"in n?n.contains(r):n.compareDocumentPosition?!!(n.compareDocumentPosition(r)&16):!1:!1}function Bd(){for(var n=window,r=Ae();r instanceof n.HTMLIFrameElement;){try{var a=typeof r.contentWindow.location.href=="string"}catch{a=!1}if(a)n=r.contentWindow;else break;r=Ae(n.document)}return r}function zc(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r&&(r==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||r==="textarea"||n.contentEditable==="true")}function a_(n){var r=Bd(),a=n.focusedElem,u=n.selectionRange;if(r!==a&&a&&a.ownerDocument&&zd(a.ownerDocument.documentElement,a)){if(u!==null&&zc(a)){if(r=u.start,n=u.end,n===void 0&&(n=r),"selectionStart"in a)a.selectionStart=r,a.selectionEnd=Math.min(n,a.value.length);else if(n=(r=a.ownerDocument||document)&&r.defaultView||window,n.getSelection){n=n.getSelection();var p=a.textContent.length,x=Math.min(u.start,p);u=u.end===void 0?x:Math.min(u.end,p),!n.extend&&x>u&&(p=u,u=x,x=p),p=kd(a,x);var w=kd(a,u);p&&w&&(n.rangeCount!==1||n.anchorNode!==p.node||n.anchorOffset!==p.offset||n.focusNode!==w.node||n.focusOffset!==w.offset)&&(r=r.createRange(),r.setStart(p.node,p.offset),n.removeAllRanges(),x>u?(n.addRange(r),n.extend(w.node,w.offset)):(r.setEnd(w.node,w.offset),n.addRange(r)))}}for(r=[],n=a;n=n.parentNode;)n.nodeType===1&&r.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof a.focus=="function"&&a.focus(),a=0;a<r.length;a++)n=r[a],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var l_=f&&"documentMode"in document&&11>=document.documentMode,As=null,Bc=null,ko=null,Hc=!1;function Hd(n,r,a){var u=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Hc||As==null||As!==Ae(u)||(u=As,"selectionStart"in u&&zc(u)?u={start:u.selectionStart,end:u.selectionEnd}:(u=(u.ownerDocument&&u.ownerDocument.defaultView||window).getSelection(),u={anchorNode:u.anchorNode,anchorOffset:u.anchorOffset,focusNode:u.focusNode,focusOffset:u.focusOffset}),ko&&Oo(ko,u)||(ko=u,u=ja(Bc,"onSelect"),0<u.length&&(r=new Lc("onSelect","select",null,r,a),n.push({event:r,listeners:u}),r.target=As)))}function Ga(n,r){var a={};return a[n.toLowerCase()]=r.toLowerCase(),a["Webkit"+n]="webkit"+r,a["Moz"+n]="moz"+r,a}var Cs={animationend:Ga("Animation","AnimationEnd"),animationiteration:Ga("Animation","AnimationIteration"),animationstart:Ga("Animation","AnimationStart"),transitionend:Ga("Transition","TransitionEnd")},Vc={},Vd={};f&&(Vd=document.createElement("div").style,"AnimationEvent"in window||(delete Cs.animationend.animation,delete Cs.animationiteration.animation,delete Cs.animationstart.animation),"TransitionEvent"in window||delete Cs.transitionend.transition);function Wa(n){if(Vc[n])return Vc[n];if(!Cs[n])return n;var r=Cs[n],a;for(a in r)if(r.hasOwnProperty(a)&&a in Vd)return Vc[n]=r[a];return n}var Gd=Wa("animationend"),Wd=Wa("animationiteration"),Xd=Wa("animationstart"),jd=Wa("transitionend"),qd=new Map,Yd="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function _r(n,r){qd.set(n,r),l(r,[n])}for(var Gc=0;Gc<Yd.length;Gc++){var Wc=Yd[Gc],c_=Wc.toLowerCase(),u_=Wc[0].toUpperCase()+Wc.slice(1);_r(c_,"on"+u_)}_r(Gd,"onAnimationEnd"),_r(Wd,"onAnimationIteration"),_r(Xd,"onAnimationStart"),_r("dblclick","onDoubleClick"),_r("focusin","onFocus"),_r("focusout","onBlur"),_r(jd,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var zo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),f_=new Set("cancel close invalid load scroll toggle".split(" ").concat(zo));function Kd(n,r,a){var u=n.type||"unknown-event";n.currentTarget=a,ba(u,r,void 0,n),n.currentTarget=null}function $d(n,r){r=(r&4)!==0;for(var a=0;a<n.length;a++){var u=n[a],p=u.event;u=u.listeners;e:{var x=void 0;if(r)for(var w=u.length-1;0<=w;w--){var N=u[w],H=N.instance,te=N.currentTarget;if(N=N.listener,H!==x&&p.isPropagationStopped())break e;Kd(p,N,te),x=H}else for(w=0;w<u.length;w++){if(N=u[w],H=N.instance,te=N.currentTarget,N=N.listener,H!==x&&p.isPropagationStopped())break e;Kd(p,N,te),x=H}}}if(jr)throw n=hr,jr=!1,hr=null,n}function Ot(n,r){var a=r[Qc];a===void 0&&(a=r[Qc]=new Set);var u=n+"__bubble";a.has(u)||(Zd(r,n,2,!1),a.add(u))}function Xc(n,r,a){var u=0;r&&(u|=4),Zd(a,n,u,r)}var Xa="_reactListening"+Math.random().toString(36).slice(2);function Bo(n){if(!n[Xa]){n[Xa]=!0,s.forEach(function(a){a!=="selectionchange"&&(f_.has(a)||Xc(a,!1,n),Xc(a,!0,n))});var r=n.nodeType===9?n:n.ownerDocument;r===null||r[Xa]||(r[Xa]=!0,Xc("selectionchange",!1,r))}}function Zd(n,r,a,u){switch(yd(r)){case 1:var p=Tv;break;case 4:p=Av;break;default:p=Rc}a=p.bind(null,r,a,n),p=void 0,!Ss||r!=="touchstart"&&r!=="touchmove"&&r!=="wheel"||(p=!0),u?p!==void 0?n.addEventListener(r,a,{capture:!0,passive:p}):n.addEventListener(r,a,!0):p!==void 0?n.addEventListener(r,a,{passive:p}):n.addEventListener(r,a,!1)}function jc(n,r,a,u,p){var x=u;if((r&1)===0&&(r&2)===0&&u!==null)e:for(;;){if(u===null)return;var w=u.tag;if(w===3||w===4){var N=u.stateNode.containerInfo;if(N===p||N.nodeType===8&&N.parentNode===p)break;if(w===4)for(w=u.return;w!==null;){var H=w.tag;if((H===3||H===4)&&(H=w.stateNode.containerInfo,H===p||H.nodeType===8&&H.parentNode===p))return;w=w.return}for(;N!==null;){if(w=qr(N),w===null)return;if(H=w.tag,H===5||H===6){u=x=w;continue e}N=N.parentNode}}u=u.return}Un(function(){var te=x,ye=X(a),Se=[];e:{var xe=qd.get(n);if(xe!==void 0){var Be=Lc,qe=n;switch(n){case"keypress":if(za(a)===0)break e;case"keydown":case"keyup":Be=Hv;break;case"focusin":qe="focus",Be=Ic;break;case"focusout":qe="blur",Be=Ic;break;case"beforeblur":case"afterblur":Be=Ic;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":Be=Ed;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":Be=Pv;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":Be=Wv;break;case Gd:case Wd:case Xd:Be=Dv;break;case jd:Be=jv;break;case"scroll":Be=Cv;break;case"wheel":Be=Yv;break;case"copy":case"cut":case"paste":Be=Iv;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":Be=Td}var $e=(r&4)!==0,jt=!$e&&n==="scroll",K=$e?xe!==null?xe+"Capture":null:xe;$e=[];for(var W=te,Z;W!==null;){Z=W;var Ce=Z.stateNode;if(Z.tag===5&&Ce!==null&&(Z=Ce,K!==null&&(Ce=En(W,K),Ce!=null&&$e.push(Ho(W,Ce,Z)))),jt)break;W=W.return}0<$e.length&&(xe=new Be(xe,qe,null,a,ye),Se.push({event:xe,listeners:$e}))}}if((r&7)===0){e:{if(xe=n==="mouseover"||n==="pointerover",Be=n==="mouseout"||n==="pointerout",xe&&a!==bt&&(qe=a.relatedTarget||a.fromElement)&&(qr(qe)||qe[Wi]))break e;if((Be||xe)&&(xe=ye.window===ye?ye:(xe=ye.ownerDocument)?xe.defaultView||xe.parentWindow:window,Be?(qe=a.relatedTarget||a.toElement,Be=te,qe=qe?qr(qe):null,qe!==null&&(jt=Ri(qe),qe!==jt||qe.tag!==5&&qe.tag!==6)&&(qe=null)):(Be=null,qe=te),Be!==qe)){if($e=Ed,Ce="onMouseLeave",K="onMouseEnter",W="mouse",(n==="pointerout"||n==="pointerover")&&($e=Td,Ce="onPointerLeave",K="onPointerEnter",W="pointer"),jt=Be==null?xe:bs(Be),Z=qe==null?xe:bs(qe),xe=new $e(Ce,W+"leave",Be,a,ye),xe.target=jt,xe.relatedTarget=Z,Ce=null,qr(ye)===te&&($e=new $e(K,W+"enter",qe,a,ye),$e.target=Z,$e.relatedTarget=jt,Ce=$e),jt=Ce,Be&&qe)t:{for($e=Be,K=qe,W=0,Z=$e;Z;Z=Rs(Z))W++;for(Z=0,Ce=K;Ce;Ce=Rs(Ce))Z++;for(;0<W-Z;)$e=Rs($e),W--;for(;0<Z-W;)K=Rs(K),Z--;for(;W--;){if($e===K||K!==null&&$e===K.alternate)break t;$e=Rs($e),K=Rs(K)}$e=null}else $e=null;Be!==null&&Qd(Se,xe,Be,$e,!1),qe!==null&&jt!==null&&Qd(Se,jt,qe,$e,!0)}}e:{if(xe=te?bs(te):window,Be=xe.nodeName&&xe.nodeName.toLowerCase(),Be==="select"||Be==="input"&&xe.type==="file")var tt=t_;else if(Ld(xe))if(Nd)tt=s_;else{tt=i_;var rt=n_}else(Be=xe.nodeName)&&Be.toLowerCase()==="input"&&(xe.type==="checkbox"||xe.type==="radio")&&(tt=r_);if(tt&&(tt=tt(n,te))){Dd(Se,tt,a,ye);break e}rt&&rt(n,xe,te),n==="focusout"&&(rt=xe._wrapperState)&&rt.controlled&&xe.type==="number"&&it(xe,"number",xe.value)}switch(rt=te?bs(te):window,n){case"focusin":(Ld(rt)||rt.contentEditable==="true")&&(As=rt,Bc=te,ko=null);break;case"focusout":ko=Bc=As=null;break;case"mousedown":Hc=!0;break;case"contextmenu":case"mouseup":case"dragend":Hc=!1,Hd(Se,a,ye);break;case"selectionchange":if(l_)break;case"keydown":case"keyup":Hd(Se,a,ye)}var st;if(Fc)e:{switch(n){case"compositionstart":var ct="onCompositionStart";break e;case"compositionend":ct="onCompositionEnd";break e;case"compositionupdate":ct="onCompositionUpdate";break e}ct=void 0}else Ts?Pd(n,a)&&(ct="onCompositionEnd"):n==="keydown"&&a.keyCode===229&&(ct="onCompositionStart");ct&&(Ad&&a.locale!=="ko"&&(Ts||ct!=="onCompositionStart"?ct==="onCompositionEnd"&&Ts&&(st=Sd()):(vr=ye,bc="value"in vr?vr.value:vr.textContent,Ts=!0)),rt=ja(te,ct),0<rt.length&&(ct=new wd(ct,n,null,a,ye),Se.push({event:ct,listeners:rt}),st?ct.data=st:(st=bd(a),st!==null&&(ct.data=st)))),(st=$v?Zv(n,a):Qv(n,a))&&(te=ja(te,"onBeforeInput"),0<te.length&&(ye=new wd("onBeforeInput","beforeinput",null,a,ye),Se.push({event:ye,listeners:te}),ye.data=st))}$d(Se,r)})}function Ho(n,r,a){return{instance:n,listener:r,currentTarget:a}}function ja(n,r){for(var a=r+"Capture",u=[];n!==null;){var p=n,x=p.stateNode;p.tag===5&&x!==null&&(p=x,x=En(n,a),x!=null&&u.unshift(Ho(n,x,p)),x=En(n,r),x!=null&&u.push(Ho(n,x,p))),n=n.return}return u}function Rs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function Qd(n,r,a,u,p){for(var x=r._reactName,w=[];a!==null&&a!==u;){var N=a,H=N.alternate,te=N.stateNode;if(H!==null&&H===u)break;N.tag===5&&te!==null&&(N=te,p?(H=En(a,x),H!=null&&w.unshift(Ho(a,H,N))):p||(H=En(a,x),H!=null&&w.push(Ho(a,H,N)))),a=a.return}w.length!==0&&n.push({event:r,listeners:w})}var h_=/\r\n?/g,d_=/\u0000|\uFFFD/g;function Jd(n){return(typeof n=="string"?n:""+n).replace(h_,`
`).replace(d_,"")}function qa(n,r,a){if(r=Jd(r),Jd(n)!==r&&a)throw Error(t(425))}function Ya(){}var qc=null,Yc=null;function Kc(n,r){return n==="textarea"||n==="noscript"||typeof r.children=="string"||typeof r.children=="number"||typeof r.dangerouslySetInnerHTML=="object"&&r.dangerouslySetInnerHTML!==null&&r.dangerouslySetInnerHTML.__html!=null}var $c=typeof setTimeout=="function"?setTimeout:void 0,p_=typeof clearTimeout=="function"?clearTimeout:void 0,ep=typeof Promise=="function"?Promise:void 0,m_=typeof queueMicrotask=="function"?queueMicrotask:typeof ep<"u"?function(n){return ep.resolve(null).then(n).catch(g_)}:$c;function g_(n){setTimeout(function(){throw n})}function Zc(n,r){var a=r,u=0;do{var p=a.nextSibling;if(n.removeChild(a),p&&p.nodeType===8)if(a=p.data,a==="/$"){if(u===0){n.removeChild(p),Lo(r);return}u--}else a!=="$"&&a!=="$?"&&a!=="$!"||u++;a=p}while(a);Lo(r)}function xr(n){for(;n!=null;n=n.nextSibling){var r=n.nodeType;if(r===1||r===3)break;if(r===8){if(r=n.data,r==="$"||r==="$!"||r==="$?")break;if(r==="/$")return null}}return n}function tp(n){n=n.previousSibling;for(var r=0;n;){if(n.nodeType===8){var a=n.data;if(a==="$"||a==="$!"||a==="$?"){if(r===0)return n;r--}else a==="/$"&&r++}n=n.previousSibling}return null}var Ps=Math.random().toString(36).slice(2),bi="__reactFiber$"+Ps,Vo="__reactProps$"+Ps,Wi="__reactContainer$"+Ps,Qc="__reactEvents$"+Ps,v_="__reactListeners$"+Ps,__="__reactHandles$"+Ps;function qr(n){var r=n[bi];if(r)return r;for(var a=n.parentNode;a;){if(r=a[Wi]||a[bi]){if(a=r.alternate,r.child!==null||a!==null&&a.child!==null)for(n=tp(n);n!==null;){if(a=n[bi])return a;n=tp(n)}return r}n=a,a=n.parentNode}return null}function Go(n){return n=n[bi]||n[Wi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function bs(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function Ka(n){return n[Vo]||null}var Jc=[],Ls=-1;function yr(n){return{current:n}}function kt(n){0>Ls||(n.current=Jc[Ls],Jc[Ls]=null,Ls--)}function Ut(n,r){Ls++,Jc[Ls]=n.current,n.current=r}var Sr={},gn=yr(Sr),On=yr(!1),Yr=Sr;function Ds(n,r){var a=n.type.contextTypes;if(!a)return Sr;var u=n.stateNode;if(u&&u.__reactInternalMemoizedUnmaskedChildContext===r)return u.__reactInternalMemoizedMaskedChildContext;var p={},x;for(x in a)p[x]=r[x];return u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=p),p}function kn(n){return n=n.childContextTypes,n!=null}function $a(){kt(On),kt(gn)}function np(n,r,a){if(gn.current!==Sr)throw Error(t(168));Ut(gn,r),Ut(On,a)}function ip(n,r,a){var u=n.stateNode;if(r=r.childContextTypes,typeof u.getChildContext!="function")return a;u=u.getChildContext();for(var p in u)if(!(p in r))throw Error(t(108,de(n)||"Unknown",p));return oe({},a,u)}function Za(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Sr,Yr=gn.current,Ut(gn,n),Ut(On,On.current),!0}function rp(n,r,a){var u=n.stateNode;if(!u)throw Error(t(169));a?(n=ip(n,r,Yr),u.__reactInternalMemoizedMergedChildContext=n,kt(On),kt(gn),Ut(gn,n)):kt(On),Ut(On,a)}var Xi=null,Qa=!1,eu=!1;function sp(n){Xi===null?Xi=[n]:Xi.push(n)}function x_(n){Qa=!0,sp(n)}function Mr(){if(!eu&&Xi!==null){eu=!0;var n=0,r=Lt;try{var a=Xi;for(Lt=1;n<a.length;n++){var u=a[n];do u=u(!0);while(u!==null)}Xi=null,Qa=!1}catch(p){throw Xi!==null&&(Xi=Xi.slice(n+1)),ne(Ke,Mr),p}finally{Lt=r,eu=!1}}return null}var Ns=[],Is=0,Ja=null,el=0,ei=[],ti=0,Kr=null,ji=1,qi="";function $r(n,r){Ns[Is++]=el,Ns[Is++]=Ja,Ja=n,el=r}function op(n,r,a){ei[ti++]=ji,ei[ti++]=qi,ei[ti++]=Kr,Kr=n;var u=ji;n=qi;var p=32-pt(u)-1;u&=~(1<<p),a+=1;var x=32-pt(r)+p;if(30<x){var w=p-p%5;x=(u&(1<<w)-1).toString(32),u>>=w,p-=w,ji=1<<32-pt(r)+p|a<<p|u,qi=x+n}else ji=1<<x|a<<p|u,qi=n}function tu(n){n.return!==null&&($r(n,1),op(n,1,0))}function nu(n){for(;n===Ja;)Ja=Ns[--Is],Ns[Is]=null,el=Ns[--Is],Ns[Is]=null;for(;n===Kr;)Kr=ei[--ti],ei[ti]=null,qi=ei[--ti],ei[ti]=null,ji=ei[--ti],ei[ti]=null}var qn=null,Yn=null,zt=!1,di=null;function ap(n,r){var a=si(5,null,null,0);a.elementType="DELETED",a.stateNode=r,a.return=n,r=n.deletions,r===null?(n.deletions=[a],n.flags|=16):r.push(a)}function lp(n,r){switch(n.tag){case 5:var a=n.type;return r=r.nodeType!==1||a.toLowerCase()!==r.nodeName.toLowerCase()?null:r,r!==null?(n.stateNode=r,qn=n,Yn=xr(r.firstChild),!0):!1;case 6:return r=n.pendingProps===""||r.nodeType!==3?null:r,r!==null?(n.stateNode=r,qn=n,Yn=null,!0):!1;case 13:return r=r.nodeType!==8?null:r,r!==null?(a=Kr!==null?{id:ji,overflow:qi}:null,n.memoizedState={dehydrated:r,treeContext:a,retryLane:1073741824},a=si(18,null,null,0),a.stateNode=r,a.return=n,n.child=a,qn=n,Yn=null,!0):!1;default:return!1}}function iu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function ru(n){if(zt){var r=Yn;if(r){var a=r;if(!lp(n,r)){if(iu(n))throw Error(t(418));r=xr(a.nextSibling);var u=qn;r&&lp(n,r)?ap(u,a):(n.flags=n.flags&-4097|2,zt=!1,qn=n)}}else{if(iu(n))throw Error(t(418));n.flags=n.flags&-4097|2,zt=!1,qn=n}}}function cp(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;qn=n}function tl(n){if(n!==qn)return!1;if(!zt)return cp(n),zt=!0,!1;var r;if((r=n.tag!==3)&&!(r=n.tag!==5)&&(r=n.type,r=r!=="head"&&r!=="body"&&!Kc(n.type,n.memoizedProps)),r&&(r=Yn)){if(iu(n))throw up(),Error(t(418));for(;r;)ap(n,r),r=xr(r.nextSibling)}if(cp(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,r=0;n;){if(n.nodeType===8){var a=n.data;if(a==="/$"){if(r===0){Yn=xr(n.nextSibling);break e}r--}else a!=="$"&&a!=="$!"&&a!=="$?"||r++}n=n.nextSibling}Yn=null}}else Yn=qn?xr(n.stateNode.nextSibling):null;return!0}function up(){for(var n=Yn;n;)n=xr(n.nextSibling)}function Us(){Yn=qn=null,zt=!1}function su(n){di===null?di=[n]:di.push(n)}var y_=T.ReactCurrentBatchConfig;function Wo(n,r,a){if(n=a.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(a._owner){if(a=a._owner,a){if(a.tag!==1)throw Error(t(309));var u=a.stateNode}if(!u)throw Error(t(147,n));var p=u,x=""+n;return r!==null&&r.ref!==null&&typeof r.ref=="function"&&r.ref._stringRef===x?r.ref:(r=function(w){var N=p.refs;w===null?delete N[x]:N[x]=w},r._stringRef=x,r)}if(typeof n!="string")throw Error(t(284));if(!a._owner)throw Error(t(290,n))}return n}function nl(n,r){throw n=Object.prototype.toString.call(r),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(r).join(", ")+"}":n))}function fp(n){var r=n._init;return r(n._payload)}function hp(n){function r(K,W){if(n){var Z=K.deletions;Z===null?(K.deletions=[W],K.flags|=16):Z.push(W)}}function a(K,W){if(!n)return null;for(;W!==null;)r(K,W),W=W.sibling;return null}function u(K,W){for(K=new Map;W!==null;)W.key!==null?K.set(W.key,W):K.set(W.index,W),W=W.sibling;return K}function p(K,W){return K=br(K,W),K.index=0,K.sibling=null,K}function x(K,W,Z){return K.index=Z,n?(Z=K.alternate,Z!==null?(Z=Z.index,Z<W?(K.flags|=2,W):Z):(K.flags|=2,W)):(K.flags|=1048576,W)}function w(K){return n&&K.alternate===null&&(K.flags|=2),K}function N(K,W,Z,Ce){return W===null||W.tag!==6?(W=$u(Z,K.mode,Ce),W.return=K,W):(W=p(W,Z),W.return=K,W)}function H(K,W,Z,Ce){var tt=Z.type;return tt===O?ye(K,W,Z.props.children,Ce,Z.key):W!==null&&(W.elementType===tt||typeof tt=="object"&&tt!==null&&tt.$$typeof===se&&fp(tt)===W.type)?(Ce=p(W,Z.props),Ce.ref=Wo(K,W,Z),Ce.return=K,Ce):(Ce=Al(Z.type,Z.key,Z.props,null,K.mode,Ce),Ce.ref=Wo(K,W,Z),Ce.return=K,Ce)}function te(K,W,Z,Ce){return W===null||W.tag!==4||W.stateNode.containerInfo!==Z.containerInfo||W.stateNode.implementation!==Z.implementation?(W=Zu(Z,K.mode,Ce),W.return=K,W):(W=p(W,Z.children||[]),W.return=K,W)}function ye(K,W,Z,Ce,tt){return W===null||W.tag!==7?(W=rs(Z,K.mode,Ce,tt),W.return=K,W):(W=p(W,Z),W.return=K,W)}function Se(K,W,Z){if(typeof W=="string"&&W!==""||typeof W=="number")return W=$u(""+W,K.mode,Z),W.return=K,W;if(typeof W=="object"&&W!==null){switch(W.$$typeof){case B:return Z=Al(W.type,W.key,W.props,null,K.mode,Z),Z.ref=Wo(K,null,W),Z.return=K,Z;case I:return W=Zu(W,K.mode,Z),W.return=K,W;case se:var Ce=W._init;return Se(K,Ce(W._payload),Z)}if(Oe(W)||ue(W))return W=rs(W,K.mode,Z,null),W.return=K,W;nl(K,W)}return null}function xe(K,W,Z,Ce){var tt=W!==null?W.key:null;if(typeof Z=="string"&&Z!==""||typeof Z=="number")return tt!==null?null:N(K,W,""+Z,Ce);if(typeof Z=="object"&&Z!==null){switch(Z.$$typeof){case B:return Z.key===tt?H(K,W,Z,Ce):null;case I:return Z.key===tt?te(K,W,Z,Ce):null;case se:return tt=Z._init,xe(K,W,tt(Z._payload),Ce)}if(Oe(Z)||ue(Z))return tt!==null?null:ye(K,W,Z,Ce,null);nl(K,Z)}return null}function Be(K,W,Z,Ce,tt){if(typeof Ce=="string"&&Ce!==""||typeof Ce=="number")return K=K.get(Z)||null,N(W,K,""+Ce,tt);if(typeof Ce=="object"&&Ce!==null){switch(Ce.$$typeof){case B:return K=K.get(Ce.key===null?Z:Ce.key)||null,H(W,K,Ce,tt);case I:return K=K.get(Ce.key===null?Z:Ce.key)||null,te(W,K,Ce,tt);case se:var rt=Ce._init;return Be(K,W,Z,rt(Ce._payload),tt)}if(Oe(Ce)||ue(Ce))return K=K.get(Z)||null,ye(W,K,Ce,tt,null);nl(W,Ce)}return null}function qe(K,W,Z,Ce){for(var tt=null,rt=null,st=W,ct=W=0,sn=null;st!==null&&ct<Z.length;ct++){st.index>ct?(sn=st,st=null):sn=st.sibling;var Rt=xe(K,st,Z[ct],Ce);if(Rt===null){st===null&&(st=sn);break}n&&st&&Rt.alternate===null&&r(K,st),W=x(Rt,W,ct),rt===null?tt=Rt:rt.sibling=Rt,rt=Rt,st=sn}if(ct===Z.length)return a(K,st),zt&&$r(K,ct),tt;if(st===null){for(;ct<Z.length;ct++)st=Se(K,Z[ct],Ce),st!==null&&(W=x(st,W,ct),rt===null?tt=st:rt.sibling=st,rt=st);return zt&&$r(K,ct),tt}for(st=u(K,st);ct<Z.length;ct++)sn=Be(st,K,ct,Z[ct],Ce),sn!==null&&(n&&sn.alternate!==null&&st.delete(sn.key===null?ct:sn.key),W=x(sn,W,ct),rt===null?tt=sn:rt.sibling=sn,rt=sn);return n&&st.forEach(function(Lr){return r(K,Lr)}),zt&&$r(K,ct),tt}function $e(K,W,Z,Ce){var tt=ue(Z);if(typeof tt!="function")throw Error(t(150));if(Z=tt.call(Z),Z==null)throw Error(t(151));for(var rt=tt=null,st=W,ct=W=0,sn=null,Rt=Z.next();st!==null&&!Rt.done;ct++,Rt=Z.next()){st.index>ct?(sn=st,st=null):sn=st.sibling;var Lr=xe(K,st,Rt.value,Ce);if(Lr===null){st===null&&(st=sn);break}n&&st&&Lr.alternate===null&&r(K,st),W=x(Lr,W,ct),rt===null?tt=Lr:rt.sibling=Lr,rt=Lr,st=sn}if(Rt.done)return a(K,st),zt&&$r(K,ct),tt;if(st===null){for(;!Rt.done;ct++,Rt=Z.next())Rt=Se(K,Rt.value,Ce),Rt!==null&&(W=x(Rt,W,ct),rt===null?tt=Rt:rt.sibling=Rt,rt=Rt);return zt&&$r(K,ct),tt}for(st=u(K,st);!Rt.done;ct++,Rt=Z.next())Rt=Be(st,K,ct,Rt.value,Ce),Rt!==null&&(n&&Rt.alternate!==null&&st.delete(Rt.key===null?ct:Rt.key),W=x(Rt,W,ct),rt===null?tt=Rt:rt.sibling=Rt,rt=Rt);return n&&st.forEach(function(J_){return r(K,J_)}),zt&&$r(K,ct),tt}function jt(K,W,Z,Ce){if(typeof Z=="object"&&Z!==null&&Z.type===O&&Z.key===null&&(Z=Z.props.children),typeof Z=="object"&&Z!==null){switch(Z.$$typeof){case B:e:{for(var tt=Z.key,rt=W;rt!==null;){if(rt.key===tt){if(tt=Z.type,tt===O){if(rt.tag===7){a(K,rt.sibling),W=p(rt,Z.props.children),W.return=K,K=W;break e}}else if(rt.elementType===tt||typeof tt=="object"&&tt!==null&&tt.$$typeof===se&&fp(tt)===rt.type){a(K,rt.sibling),W=p(rt,Z.props),W.ref=Wo(K,rt,Z),W.return=K,K=W;break e}a(K,rt);break}else r(K,rt);rt=rt.sibling}Z.type===O?(W=rs(Z.props.children,K.mode,Ce,Z.key),W.return=K,K=W):(Ce=Al(Z.type,Z.key,Z.props,null,K.mode,Ce),Ce.ref=Wo(K,W,Z),Ce.return=K,K=Ce)}return w(K);case I:e:{for(rt=Z.key;W!==null;){if(W.key===rt)if(W.tag===4&&W.stateNode.containerInfo===Z.containerInfo&&W.stateNode.implementation===Z.implementation){a(K,W.sibling),W=p(W,Z.children||[]),W.return=K,K=W;break e}else{a(K,W);break}else r(K,W);W=W.sibling}W=Zu(Z,K.mode,Ce),W.return=K,K=W}return w(K);case se:return rt=Z._init,jt(K,W,rt(Z._payload),Ce)}if(Oe(Z))return qe(K,W,Z,Ce);if(ue(Z))return $e(K,W,Z,Ce);nl(K,Z)}return typeof Z=="string"&&Z!==""||typeof Z=="number"?(Z=""+Z,W!==null&&W.tag===6?(a(K,W.sibling),W=p(W,Z),W.return=K,K=W):(a(K,W),W=$u(Z,K.mode,Ce),W.return=K,K=W),w(K)):a(K,W)}return jt}var Fs=hp(!0),dp=hp(!1),il=yr(null),rl=null,Os=null,ou=null;function au(){ou=Os=rl=null}function lu(n){var r=il.current;kt(il),n._currentValue=r}function cu(n,r,a){for(;n!==null;){var u=n.alternate;if((n.childLanes&r)!==r?(n.childLanes|=r,u!==null&&(u.childLanes|=r)):u!==null&&(u.childLanes&r)!==r&&(u.childLanes|=r),n===a)break;n=n.return}}function ks(n,r){rl=n,ou=Os=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&r)!==0&&(zn=!0),n.firstContext=null)}function ni(n){var r=n._currentValue;if(ou!==n)if(n={context:n,memoizedValue:r,next:null},Os===null){if(rl===null)throw Error(t(308));Os=n,rl.dependencies={lanes:0,firstContext:n}}else Os=Os.next=n;return r}var Zr=null;function uu(n){Zr===null?Zr=[n]:Zr.push(n)}function pp(n,r,a,u){var p=r.interleaved;return p===null?(a.next=a,uu(r)):(a.next=p.next,p.next=a),r.interleaved=a,Yi(n,u)}function Yi(n,r){n.lanes|=r;var a=n.alternate;for(a!==null&&(a.lanes|=r),a=n,n=n.return;n!==null;)n.childLanes|=r,a=n.alternate,a!==null&&(a.childLanes|=r),a=n,n=n.return;return a.tag===3?a.stateNode:null}var Er=!1;function fu(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function mp(n,r){n=n.updateQueue,r.updateQueue===n&&(r.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Ki(n,r){return{eventTime:n,lane:r,tag:0,payload:null,callback:null,next:null}}function wr(n,r,a){var u=n.updateQueue;if(u===null)return null;if(u=u.shared,(wt&2)!==0){var p=u.pending;return p===null?r.next=r:(r.next=p.next,p.next=r),u.pending=r,Yi(n,a)}return p=u.interleaved,p===null?(r.next=r,uu(u)):(r.next=p.next,p.next=r),u.interleaved=r,Yi(n,a)}function sl(n,r,a){if(r=r.updateQueue,r!==null&&(r=r.shared,(a&4194240)!==0)){var u=r.lanes;u&=n.pendingLanes,a|=u,r.lanes=a,Tc(n,a)}}function gp(n,r){var a=n.updateQueue,u=n.alternate;if(u!==null&&(u=u.updateQueue,a===u)){var p=null,x=null;if(a=a.firstBaseUpdate,a!==null){do{var w={eventTime:a.eventTime,lane:a.lane,tag:a.tag,payload:a.payload,callback:a.callback,next:null};x===null?p=x=w:x=x.next=w,a=a.next}while(a!==null);x===null?p=x=r:x=x.next=r}else p=x=r;a={baseState:u.baseState,firstBaseUpdate:p,lastBaseUpdate:x,shared:u.shared,effects:u.effects},n.updateQueue=a;return}n=a.lastBaseUpdate,n===null?a.firstBaseUpdate=r:n.next=r,a.lastBaseUpdate=r}function ol(n,r,a,u){var p=n.updateQueue;Er=!1;var x=p.firstBaseUpdate,w=p.lastBaseUpdate,N=p.shared.pending;if(N!==null){p.shared.pending=null;var H=N,te=H.next;H.next=null,w===null?x=te:w.next=te,w=H;var ye=n.alternate;ye!==null&&(ye=ye.updateQueue,N=ye.lastBaseUpdate,N!==w&&(N===null?ye.firstBaseUpdate=te:N.next=te,ye.lastBaseUpdate=H))}if(x!==null){var Se=p.baseState;w=0,ye=te=H=null,N=x;do{var xe=N.lane,Be=N.eventTime;if((u&xe)===xe){ye!==null&&(ye=ye.next={eventTime:Be,lane:0,tag:N.tag,payload:N.payload,callback:N.callback,next:null});e:{var qe=n,$e=N;switch(xe=r,Be=a,$e.tag){case 1:if(qe=$e.payload,typeof qe=="function"){Se=qe.call(Be,Se,xe);break e}Se=qe;break e;case 3:qe.flags=qe.flags&-65537|128;case 0:if(qe=$e.payload,xe=typeof qe=="function"?qe.call(Be,Se,xe):qe,xe==null)break e;Se=oe({},Se,xe);break e;case 2:Er=!0}}N.callback!==null&&N.lane!==0&&(n.flags|=64,xe=p.effects,xe===null?p.effects=[N]:xe.push(N))}else Be={eventTime:Be,lane:xe,tag:N.tag,payload:N.payload,callback:N.callback,next:null},ye===null?(te=ye=Be,H=Se):ye=ye.next=Be,w|=xe;if(N=N.next,N===null){if(N=p.shared.pending,N===null)break;xe=N,N=xe.next,xe.next=null,p.lastBaseUpdate=xe,p.shared.pending=null}}while(!0);if(ye===null&&(H=Se),p.baseState=H,p.firstBaseUpdate=te,p.lastBaseUpdate=ye,r=p.shared.interleaved,r!==null){p=r;do w|=p.lane,p=p.next;while(p!==r)}else x===null&&(p.shared.lanes=0);es|=w,n.lanes=w,n.memoizedState=Se}}function vp(n,r,a){if(n=r.effects,r.effects=null,n!==null)for(r=0;r<n.length;r++){var u=n[r],p=u.callback;if(p!==null){if(u.callback=null,u=a,typeof p!="function")throw Error(t(191,p));p.call(u)}}}var Xo={},Li=yr(Xo),jo=yr(Xo),qo=yr(Xo);function Qr(n){if(n===Xo)throw Error(t(174));return n}function hu(n,r){switch(Ut(qo,r),Ut(jo,n),Ut(Li,Xo),n=r.nodeType,n){case 9:case 11:r=(r=r.documentElement)?r.namespaceURI:Ye(null,"");break;default:n=n===8?r.parentNode:r,r=n.namespaceURI||null,n=n.tagName,r=Ye(r,n)}kt(Li),Ut(Li,r)}function zs(){kt(Li),kt(jo),kt(qo)}function _p(n){Qr(qo.current);var r=Qr(Li.current),a=Ye(r,n.type);r!==a&&(Ut(jo,n),Ut(Li,a))}function du(n){jo.current===n&&(kt(Li),kt(jo))}var Bt=yr(0);function al(n){for(var r=n;r!==null;){if(r.tag===13){var a=r.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||a.data==="$?"||a.data==="$!"))return r}else if(r.tag===19&&r.memoizedProps.revealOrder!==void 0){if((r.flags&128)!==0)return r}else if(r.child!==null){r.child.return=r,r=r.child;continue}if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return null;r=r.return}r.sibling.return=r.return,r=r.sibling}return null}var pu=[];function mu(){for(var n=0;n<pu.length;n++)pu[n]._workInProgressVersionPrimary=null;pu.length=0}var ll=T.ReactCurrentDispatcher,gu=T.ReactCurrentBatchConfig,Jr=0,Ht=null,Qt=null,nn=null,cl=!1,Yo=!1,Ko=0,S_=0;function vn(){throw Error(t(321))}function vu(n,r){if(r===null)return!1;for(var a=0;a<r.length&&a<n.length;a++)if(!hi(n[a],r[a]))return!1;return!0}function _u(n,r,a,u,p,x){if(Jr=x,Ht=r,r.memoizedState=null,r.updateQueue=null,r.lanes=0,ll.current=n===null||n.memoizedState===null?T_:A_,n=a(u,p),Yo){x=0;do{if(Yo=!1,Ko=0,25<=x)throw Error(t(301));x+=1,nn=Qt=null,r.updateQueue=null,ll.current=C_,n=a(u,p)}while(Yo)}if(ll.current=hl,r=Qt!==null&&Qt.next!==null,Jr=0,nn=Qt=Ht=null,cl=!1,r)throw Error(t(300));return n}function xu(){var n=Ko!==0;return Ko=0,n}function Di(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return nn===null?Ht.memoizedState=nn=n:nn=nn.next=n,nn}function ii(){if(Qt===null){var n=Ht.alternate;n=n!==null?n.memoizedState:null}else n=Qt.next;var r=nn===null?Ht.memoizedState:nn.next;if(r!==null)nn=r,Qt=n;else{if(n===null)throw Error(t(310));Qt=n,n={memoizedState:Qt.memoizedState,baseState:Qt.baseState,baseQueue:Qt.baseQueue,queue:Qt.queue,next:null},nn===null?Ht.memoizedState=nn=n:nn=nn.next=n}return nn}function $o(n,r){return typeof r=="function"?r(n):r}function yu(n){var r=ii(),a=r.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var u=Qt,p=u.baseQueue,x=a.pending;if(x!==null){if(p!==null){var w=p.next;p.next=x.next,x.next=w}u.baseQueue=p=x,a.pending=null}if(p!==null){x=p.next,u=u.baseState;var N=w=null,H=null,te=x;do{var ye=te.lane;if((Jr&ye)===ye)H!==null&&(H=H.next={lane:0,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null}),u=te.hasEagerState?te.eagerState:n(u,te.action);else{var Se={lane:ye,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null};H===null?(N=H=Se,w=u):H=H.next=Se,Ht.lanes|=ye,es|=ye}te=te.next}while(te!==null&&te!==x);H===null?w=u:H.next=N,hi(u,r.memoizedState)||(zn=!0),r.memoizedState=u,r.baseState=w,r.baseQueue=H,a.lastRenderedState=u}if(n=a.interleaved,n!==null){p=n;do x=p.lane,Ht.lanes|=x,es|=x,p=p.next;while(p!==n)}else p===null&&(a.lanes=0);return[r.memoizedState,a.dispatch]}function Su(n){var r=ii(),a=r.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var u=a.dispatch,p=a.pending,x=r.memoizedState;if(p!==null){a.pending=null;var w=p=p.next;do x=n(x,w.action),w=w.next;while(w!==p);hi(x,r.memoizedState)||(zn=!0),r.memoizedState=x,r.baseQueue===null&&(r.baseState=x),a.lastRenderedState=x}return[x,u]}function xp(){}function yp(n,r){var a=Ht,u=ii(),p=r(),x=!hi(u.memoizedState,p);if(x&&(u.memoizedState=p,zn=!0),u=u.queue,Mu(Ep.bind(null,a,u,n),[n]),u.getSnapshot!==r||x||nn!==null&&nn.memoizedState.tag&1){if(a.flags|=2048,Zo(9,Mp.bind(null,a,u,p,r),void 0,null),rn===null)throw Error(t(349));(Jr&30)!==0||Sp(a,r,p)}return p}function Sp(n,r,a){n.flags|=16384,n={getSnapshot:r,value:a},r=Ht.updateQueue,r===null?(r={lastEffect:null,stores:null},Ht.updateQueue=r,r.stores=[n]):(a=r.stores,a===null?r.stores=[n]:a.push(n))}function Mp(n,r,a,u){r.value=a,r.getSnapshot=u,wp(r)&&Tp(n)}function Ep(n,r,a){return a(function(){wp(r)&&Tp(n)})}function wp(n){var r=n.getSnapshot;n=n.value;try{var a=r();return!hi(n,a)}catch{return!0}}function Tp(n){var r=Yi(n,1);r!==null&&vi(r,n,1,-1)}function Ap(n){var r=Di();return typeof n=="function"&&(n=n()),r.memoizedState=r.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:$o,lastRenderedState:n},r.queue=n,n=n.dispatch=w_.bind(null,Ht,n),[r.memoizedState,n]}function Zo(n,r,a,u){return n={tag:n,create:r,destroy:a,deps:u,next:null},r=Ht.updateQueue,r===null?(r={lastEffect:null,stores:null},Ht.updateQueue=r,r.lastEffect=n.next=n):(a=r.lastEffect,a===null?r.lastEffect=n.next=n:(u=a.next,a.next=n,n.next=u,r.lastEffect=n)),n}function Cp(){return ii().memoizedState}function ul(n,r,a,u){var p=Di();Ht.flags|=n,p.memoizedState=Zo(1|r,a,void 0,u===void 0?null:u)}function fl(n,r,a,u){var p=ii();u=u===void 0?null:u;var x=void 0;if(Qt!==null){var w=Qt.memoizedState;if(x=w.destroy,u!==null&&vu(u,w.deps)){p.memoizedState=Zo(r,a,x,u);return}}Ht.flags|=n,p.memoizedState=Zo(1|r,a,x,u)}function Rp(n,r){return ul(8390656,8,n,r)}function Mu(n,r){return fl(2048,8,n,r)}function Pp(n,r){return fl(4,2,n,r)}function bp(n,r){return fl(4,4,n,r)}function Lp(n,r){if(typeof r=="function")return n=n(),r(n),function(){r(null)};if(r!=null)return n=n(),r.current=n,function(){r.current=null}}function Dp(n,r,a){return a=a!=null?a.concat([n]):null,fl(4,4,Lp.bind(null,r,n),a)}function Eu(){}function Np(n,r){var a=ii();r=r===void 0?null:r;var u=a.memoizedState;return u!==null&&r!==null&&vu(r,u[1])?u[0]:(a.memoizedState=[n,r],n)}function Ip(n,r){var a=ii();r=r===void 0?null:r;var u=a.memoizedState;return u!==null&&r!==null&&vu(r,u[1])?u[0]:(n=n(),a.memoizedState=[n,r],n)}function Up(n,r,a){return(Jr&21)===0?(n.baseState&&(n.baseState=!1,zn=!0),n.memoizedState=a):(hi(a,r)||(a=wn(),Ht.lanes|=a,es|=a,n.baseState=!0),r)}function M_(n,r){var a=Lt;Lt=a!==0&&4>a?a:4,n(!0);var u=gu.transition;gu.transition={};try{n(!1),r()}finally{Lt=a,gu.transition=u}}function Fp(){return ii().memoizedState}function E_(n,r,a){var u=Rr(n);if(a={lane:u,action:a,hasEagerState:!1,eagerState:null,next:null},Op(n))kp(r,a);else if(a=pp(n,r,a,u),a!==null){var p=An();vi(a,n,u,p),zp(a,r,u)}}function w_(n,r,a){var u=Rr(n),p={lane:u,action:a,hasEagerState:!1,eagerState:null,next:null};if(Op(n))kp(r,p);else{var x=n.alternate;if(n.lanes===0&&(x===null||x.lanes===0)&&(x=r.lastRenderedReducer,x!==null))try{var w=r.lastRenderedState,N=x(w,a);if(p.hasEagerState=!0,p.eagerState=N,hi(N,w)){var H=r.interleaved;H===null?(p.next=p,uu(r)):(p.next=H.next,H.next=p),r.interleaved=p;return}}catch{}finally{}a=pp(n,r,p,u),a!==null&&(p=An(),vi(a,n,u,p),zp(a,r,u))}}function Op(n){var r=n.alternate;return n===Ht||r!==null&&r===Ht}function kp(n,r){Yo=cl=!0;var a=n.pending;a===null?r.next=r:(r.next=a.next,a.next=r),n.pending=r}function zp(n,r,a){if((a&4194240)!==0){var u=r.lanes;u&=n.pendingLanes,a|=u,r.lanes=a,Tc(n,a)}}var hl={readContext:ni,useCallback:vn,useContext:vn,useEffect:vn,useImperativeHandle:vn,useInsertionEffect:vn,useLayoutEffect:vn,useMemo:vn,useReducer:vn,useRef:vn,useState:vn,useDebugValue:vn,useDeferredValue:vn,useTransition:vn,useMutableSource:vn,useSyncExternalStore:vn,useId:vn,unstable_isNewReconciler:!1},T_={readContext:ni,useCallback:function(n,r){return Di().memoizedState=[n,r===void 0?null:r],n},useContext:ni,useEffect:Rp,useImperativeHandle:function(n,r,a){return a=a!=null?a.concat([n]):null,ul(4194308,4,Lp.bind(null,r,n),a)},useLayoutEffect:function(n,r){return ul(4194308,4,n,r)},useInsertionEffect:function(n,r){return ul(4,2,n,r)},useMemo:function(n,r){var a=Di();return r=r===void 0?null:r,n=n(),a.memoizedState=[n,r],n},useReducer:function(n,r,a){var u=Di();return r=a!==void 0?a(r):r,u.memoizedState=u.baseState=r,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:r},u.queue=n,n=n.dispatch=E_.bind(null,Ht,n),[u.memoizedState,n]},useRef:function(n){var r=Di();return n={current:n},r.memoizedState=n},useState:Ap,useDebugValue:Eu,useDeferredValue:function(n){return Di().memoizedState=n},useTransition:function(){var n=Ap(!1),r=n[0];return n=M_.bind(null,n[1]),Di().memoizedState=n,[r,n]},useMutableSource:function(){},useSyncExternalStore:function(n,r,a){var u=Ht,p=Di();if(zt){if(a===void 0)throw Error(t(407));a=a()}else{if(a=r(),rn===null)throw Error(t(349));(Jr&30)!==0||Sp(u,r,a)}p.memoizedState=a;var x={value:a,getSnapshot:r};return p.queue=x,Rp(Ep.bind(null,u,x,n),[n]),u.flags|=2048,Zo(9,Mp.bind(null,u,x,a,r),void 0,null),a},useId:function(){var n=Di(),r=rn.identifierPrefix;if(zt){var a=qi,u=ji;a=(u&~(1<<32-pt(u)-1)).toString(32)+a,r=":"+r+"R"+a,a=Ko++,0<a&&(r+="H"+a.toString(32)),r+=":"}else a=S_++,r=":"+r+"r"+a.toString(32)+":";return n.memoizedState=r},unstable_isNewReconciler:!1},A_={readContext:ni,useCallback:Np,useContext:ni,useEffect:Mu,useImperativeHandle:Dp,useInsertionEffect:Pp,useLayoutEffect:bp,useMemo:Ip,useReducer:yu,useRef:Cp,useState:function(){return yu($o)},useDebugValue:Eu,useDeferredValue:function(n){var r=ii();return Up(r,Qt.memoizedState,n)},useTransition:function(){var n=yu($o)[0],r=ii().memoizedState;return[n,r]},useMutableSource:xp,useSyncExternalStore:yp,useId:Fp,unstable_isNewReconciler:!1},C_={readContext:ni,useCallback:Np,useContext:ni,useEffect:Mu,useImperativeHandle:Dp,useInsertionEffect:Pp,useLayoutEffect:bp,useMemo:Ip,useReducer:Su,useRef:Cp,useState:function(){return Su($o)},useDebugValue:Eu,useDeferredValue:function(n){var r=ii();return Qt===null?r.memoizedState=n:Up(r,Qt.memoizedState,n)},useTransition:function(){var n=Su($o)[0],r=ii().memoizedState;return[n,r]},useMutableSource:xp,useSyncExternalStore:yp,useId:Fp,unstable_isNewReconciler:!1};function pi(n,r){if(n&&n.defaultProps){r=oe({},r),n=n.defaultProps;for(var a in n)r[a]===void 0&&(r[a]=n[a]);return r}return r}function wu(n,r,a,u){r=n.memoizedState,a=a(u,r),a=a==null?r:oe({},r,a),n.memoizedState=a,n.lanes===0&&(n.updateQueue.baseState=a)}var dl={isMounted:function(n){return(n=n._reactInternals)?Ri(n)===n:!1},enqueueSetState:function(n,r,a){n=n._reactInternals;var u=An(),p=Rr(n),x=Ki(u,p);x.payload=r,a!=null&&(x.callback=a),r=wr(n,x,p),r!==null&&(vi(r,n,p,u),sl(r,n,p))},enqueueReplaceState:function(n,r,a){n=n._reactInternals;var u=An(),p=Rr(n),x=Ki(u,p);x.tag=1,x.payload=r,a!=null&&(x.callback=a),r=wr(n,x,p),r!==null&&(vi(r,n,p,u),sl(r,n,p))},enqueueForceUpdate:function(n,r){n=n._reactInternals;var a=An(),u=Rr(n),p=Ki(a,u);p.tag=2,r!=null&&(p.callback=r),r=wr(n,p,u),r!==null&&(vi(r,n,u,a),sl(r,n,u))}};function Bp(n,r,a,u,p,x,w){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(u,x,w):r.prototype&&r.prototype.isPureReactComponent?!Oo(a,u)||!Oo(p,x):!0}function Hp(n,r,a){var u=!1,p=Sr,x=r.contextType;return typeof x=="object"&&x!==null?x=ni(x):(p=kn(r)?Yr:gn.current,u=r.contextTypes,x=(u=u!=null)?Ds(n,p):Sr),r=new r(a,x),n.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=dl,n.stateNode=r,r._reactInternals=n,u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=p,n.__reactInternalMemoizedMaskedChildContext=x),r}function Vp(n,r,a,u){n=r.state,typeof r.componentWillReceiveProps=="function"&&r.componentWillReceiveProps(a,u),typeof r.UNSAFE_componentWillReceiveProps=="function"&&r.UNSAFE_componentWillReceiveProps(a,u),r.state!==n&&dl.enqueueReplaceState(r,r.state,null)}function Tu(n,r,a,u){var p=n.stateNode;p.props=a,p.state=n.memoizedState,p.refs={},fu(n);var x=r.contextType;typeof x=="object"&&x!==null?p.context=ni(x):(x=kn(r)?Yr:gn.current,p.context=Ds(n,x)),p.state=n.memoizedState,x=r.getDerivedStateFromProps,typeof x=="function"&&(wu(n,r,x,a),p.state=n.memoizedState),typeof r.getDerivedStateFromProps=="function"||typeof p.getSnapshotBeforeUpdate=="function"||typeof p.UNSAFE_componentWillMount!="function"&&typeof p.componentWillMount!="function"||(r=p.state,typeof p.componentWillMount=="function"&&p.componentWillMount(),typeof p.UNSAFE_componentWillMount=="function"&&p.UNSAFE_componentWillMount(),r!==p.state&&dl.enqueueReplaceState(p,p.state,null),ol(n,a,p,u),p.state=n.memoizedState),typeof p.componentDidMount=="function"&&(n.flags|=4194308)}function Bs(n,r){try{var a="",u=r;do a+=he(u),u=u.return;while(u);var p=a}catch(x){p=`
Error generating stack: `+x.message+`
`+x.stack}return{value:n,source:r,stack:p,digest:null}}function Au(n,r,a){return{value:n,source:null,stack:a??null,digest:r??null}}function Cu(n,r){try{console.error(r.value)}catch(a){setTimeout(function(){throw a})}}var R_=typeof WeakMap=="function"?WeakMap:Map;function Gp(n,r,a){a=Ki(-1,a),a.tag=3,a.payload={element:null};var u=r.value;return a.callback=function(){yl||(yl=!0,Vu=u),Cu(n,r)},a}function Wp(n,r,a){a=Ki(-1,a),a.tag=3;var u=n.type.getDerivedStateFromError;if(typeof u=="function"){var p=r.value;a.payload=function(){return u(p)},a.callback=function(){Cu(n,r)}}var x=n.stateNode;return x!==null&&typeof x.componentDidCatch=="function"&&(a.callback=function(){Cu(n,r),typeof u!="function"&&(Ar===null?Ar=new Set([this]):Ar.add(this));var w=r.stack;this.componentDidCatch(r.value,{componentStack:w!==null?w:""})}),a}function Xp(n,r,a){var u=n.pingCache;if(u===null){u=n.pingCache=new R_;var p=new Set;u.set(r,p)}else p=u.get(r),p===void 0&&(p=new Set,u.set(r,p));p.has(a)||(p.add(a),n=V_.bind(null,n,r,a),r.then(n,n))}function jp(n){do{var r;if((r=n.tag===13)&&(r=n.memoizedState,r=r!==null?r.dehydrated!==null:!0),r)return n;n=n.return}while(n!==null);return null}function qp(n,r,a,u,p){return(n.mode&1)===0?(n===r?n.flags|=65536:(n.flags|=128,a.flags|=131072,a.flags&=-52805,a.tag===1&&(a.alternate===null?a.tag=17:(r=Ki(-1,1),r.tag=2,wr(a,r,1))),a.lanes|=1),n):(n.flags|=65536,n.lanes=p,n)}var P_=T.ReactCurrentOwner,zn=!1;function Tn(n,r,a,u){r.child=n===null?dp(r,null,a,u):Fs(r,n.child,a,u)}function Yp(n,r,a,u,p){a=a.render;var x=r.ref;return ks(r,p),u=_u(n,r,a,u,x,p),a=xu(),n!==null&&!zn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~p,$i(n,r,p)):(zt&&a&&tu(r),r.flags|=1,Tn(n,r,u,p),r.child)}function Kp(n,r,a,u,p){if(n===null){var x=a.type;return typeof x=="function"&&!Ku(x)&&x.defaultProps===void 0&&a.compare===null&&a.defaultProps===void 0?(r.tag=15,r.type=x,$p(n,r,x,u,p)):(n=Al(a.type,null,u,r,r.mode,p),n.ref=r.ref,n.return=r,r.child=n)}if(x=n.child,(n.lanes&p)===0){var w=x.memoizedProps;if(a=a.compare,a=a!==null?a:Oo,a(w,u)&&n.ref===r.ref)return $i(n,r,p)}return r.flags|=1,n=br(x,u),n.ref=r.ref,n.return=r,r.child=n}function $p(n,r,a,u,p){if(n!==null){var x=n.memoizedProps;if(Oo(x,u)&&n.ref===r.ref)if(zn=!1,r.pendingProps=u=x,(n.lanes&p)!==0)(n.flags&131072)!==0&&(zn=!0);else return r.lanes=n.lanes,$i(n,r,p)}return Ru(n,r,a,u,p)}function Zp(n,r,a){var u=r.pendingProps,p=u.children,x=n!==null?n.memoizedState:null;if(u.mode==="hidden")if((r.mode&1)===0)r.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ut(Vs,Kn),Kn|=a;else{if((a&1073741824)===0)return n=x!==null?x.baseLanes|a:a,r.lanes=r.childLanes=1073741824,r.memoizedState={baseLanes:n,cachePool:null,transitions:null},r.updateQueue=null,Ut(Vs,Kn),Kn|=n,null;r.memoizedState={baseLanes:0,cachePool:null,transitions:null},u=x!==null?x.baseLanes:a,Ut(Vs,Kn),Kn|=u}else x!==null?(u=x.baseLanes|a,r.memoizedState=null):u=a,Ut(Vs,Kn),Kn|=u;return Tn(n,r,p,a),r.child}function Qp(n,r){var a=r.ref;(n===null&&a!==null||n!==null&&n.ref!==a)&&(r.flags|=512,r.flags|=2097152)}function Ru(n,r,a,u,p){var x=kn(a)?Yr:gn.current;return x=Ds(r,x),ks(r,p),a=_u(n,r,a,u,x,p),u=xu(),n!==null&&!zn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~p,$i(n,r,p)):(zt&&u&&tu(r),r.flags|=1,Tn(n,r,a,p),r.child)}function Jp(n,r,a,u,p){if(kn(a)){var x=!0;Za(r)}else x=!1;if(ks(r,p),r.stateNode===null)ml(n,r),Hp(r,a,u),Tu(r,a,u,p),u=!0;else if(n===null){var w=r.stateNode,N=r.memoizedProps;w.props=N;var H=w.context,te=a.contextType;typeof te=="object"&&te!==null?te=ni(te):(te=kn(a)?Yr:gn.current,te=Ds(r,te));var ye=a.getDerivedStateFromProps,Se=typeof ye=="function"||typeof w.getSnapshotBeforeUpdate=="function";Se||typeof w.UNSAFE_componentWillReceiveProps!="function"&&typeof w.componentWillReceiveProps!="function"||(N!==u||H!==te)&&Vp(r,w,u,te),Er=!1;var xe=r.memoizedState;w.state=xe,ol(r,u,w,p),H=r.memoizedState,N!==u||xe!==H||On.current||Er?(typeof ye=="function"&&(wu(r,a,ye,u),H=r.memoizedState),(N=Er||Bp(r,a,N,u,xe,H,te))?(Se||typeof w.UNSAFE_componentWillMount!="function"&&typeof w.componentWillMount!="function"||(typeof w.componentWillMount=="function"&&w.componentWillMount(),typeof w.UNSAFE_componentWillMount=="function"&&w.UNSAFE_componentWillMount()),typeof w.componentDidMount=="function"&&(r.flags|=4194308)):(typeof w.componentDidMount=="function"&&(r.flags|=4194308),r.memoizedProps=u,r.memoizedState=H),w.props=u,w.state=H,w.context=te,u=N):(typeof w.componentDidMount=="function"&&(r.flags|=4194308),u=!1)}else{w=r.stateNode,mp(n,r),N=r.memoizedProps,te=r.type===r.elementType?N:pi(r.type,N),w.props=te,Se=r.pendingProps,xe=w.context,H=a.contextType,typeof H=="object"&&H!==null?H=ni(H):(H=kn(a)?Yr:gn.current,H=Ds(r,H));var Be=a.getDerivedStateFromProps;(ye=typeof Be=="function"||typeof w.getSnapshotBeforeUpdate=="function")||typeof w.UNSAFE_componentWillReceiveProps!="function"&&typeof w.componentWillReceiveProps!="function"||(N!==Se||xe!==H)&&Vp(r,w,u,H),Er=!1,xe=r.memoizedState,w.state=xe,ol(r,u,w,p);var qe=r.memoizedState;N!==Se||xe!==qe||On.current||Er?(typeof Be=="function"&&(wu(r,a,Be,u),qe=r.memoizedState),(te=Er||Bp(r,a,te,u,xe,qe,H)||!1)?(ye||typeof w.UNSAFE_componentWillUpdate!="function"&&typeof w.componentWillUpdate!="function"||(typeof w.componentWillUpdate=="function"&&w.componentWillUpdate(u,qe,H),typeof w.UNSAFE_componentWillUpdate=="function"&&w.UNSAFE_componentWillUpdate(u,qe,H)),typeof w.componentDidUpdate=="function"&&(r.flags|=4),typeof w.getSnapshotBeforeUpdate=="function"&&(r.flags|=1024)):(typeof w.componentDidUpdate!="function"||N===n.memoizedProps&&xe===n.memoizedState||(r.flags|=4),typeof w.getSnapshotBeforeUpdate!="function"||N===n.memoizedProps&&xe===n.memoizedState||(r.flags|=1024),r.memoizedProps=u,r.memoizedState=qe),w.props=u,w.state=qe,w.context=H,u=te):(typeof w.componentDidUpdate!="function"||N===n.memoizedProps&&xe===n.memoizedState||(r.flags|=4),typeof w.getSnapshotBeforeUpdate!="function"||N===n.memoizedProps&&xe===n.memoizedState||(r.flags|=1024),u=!1)}return Pu(n,r,a,u,x,p)}function Pu(n,r,a,u,p,x){Qp(n,r);var w=(r.flags&128)!==0;if(!u&&!w)return p&&rp(r,a,!1),$i(n,r,x);u=r.stateNode,P_.current=r;var N=w&&typeof a.getDerivedStateFromError!="function"?null:u.render();return r.flags|=1,n!==null&&w?(r.child=Fs(r,n.child,null,x),r.child=Fs(r,null,N,x)):Tn(n,r,N,x),r.memoizedState=u.state,p&&rp(r,a,!0),r.child}function em(n){var r=n.stateNode;r.pendingContext?np(n,r.pendingContext,r.pendingContext!==r.context):r.context&&np(n,r.context,!1),hu(n,r.containerInfo)}function tm(n,r,a,u,p){return Us(),su(p),r.flags|=256,Tn(n,r,a,u),r.child}var bu={dehydrated:null,treeContext:null,retryLane:0};function Lu(n){return{baseLanes:n,cachePool:null,transitions:null}}function nm(n,r,a){var u=r.pendingProps,p=Bt.current,x=!1,w=(r.flags&128)!==0,N;if((N=w)||(N=n!==null&&n.memoizedState===null?!1:(p&2)!==0),N?(x=!0,r.flags&=-129):(n===null||n.memoizedState!==null)&&(p|=1),Ut(Bt,p&1),n===null)return ru(r),n=r.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((r.mode&1)===0?r.lanes=1:n.data==="$!"?r.lanes=8:r.lanes=1073741824,null):(w=u.children,n=u.fallback,x?(u=r.mode,x=r.child,w={mode:"hidden",children:w},(u&1)===0&&x!==null?(x.childLanes=0,x.pendingProps=w):x=Cl(w,u,0,null),n=rs(n,u,a,null),x.return=r,n.return=r,x.sibling=n,r.child=x,r.child.memoizedState=Lu(a),r.memoizedState=bu,n):Du(r,w));if(p=n.memoizedState,p!==null&&(N=p.dehydrated,N!==null))return b_(n,r,w,u,N,p,a);if(x){x=u.fallback,w=r.mode,p=n.child,N=p.sibling;var H={mode:"hidden",children:u.children};return(w&1)===0&&r.child!==p?(u=r.child,u.childLanes=0,u.pendingProps=H,r.deletions=null):(u=br(p,H),u.subtreeFlags=p.subtreeFlags&14680064),N!==null?x=br(N,x):(x=rs(x,w,a,null),x.flags|=2),x.return=r,u.return=r,u.sibling=x,r.child=u,u=x,x=r.child,w=n.child.memoizedState,w=w===null?Lu(a):{baseLanes:w.baseLanes|a,cachePool:null,transitions:w.transitions},x.memoizedState=w,x.childLanes=n.childLanes&~a,r.memoizedState=bu,u}return x=n.child,n=x.sibling,u=br(x,{mode:"visible",children:u.children}),(r.mode&1)===0&&(u.lanes=a),u.return=r,u.sibling=null,n!==null&&(a=r.deletions,a===null?(r.deletions=[n],r.flags|=16):a.push(n)),r.child=u,r.memoizedState=null,u}function Du(n,r){return r=Cl({mode:"visible",children:r},n.mode,0,null),r.return=n,n.child=r}function pl(n,r,a,u){return u!==null&&su(u),Fs(r,n.child,null,a),n=Du(r,r.pendingProps.children),n.flags|=2,r.memoizedState=null,n}function b_(n,r,a,u,p,x,w){if(a)return r.flags&256?(r.flags&=-257,u=Au(Error(t(422))),pl(n,r,w,u)):r.memoizedState!==null?(r.child=n.child,r.flags|=128,null):(x=u.fallback,p=r.mode,u=Cl({mode:"visible",children:u.children},p,0,null),x=rs(x,p,w,null),x.flags|=2,u.return=r,x.return=r,u.sibling=x,r.child=u,(r.mode&1)!==0&&Fs(r,n.child,null,w),r.child.memoizedState=Lu(w),r.memoizedState=bu,x);if((r.mode&1)===0)return pl(n,r,w,null);if(p.data==="$!"){if(u=p.nextSibling&&p.nextSibling.dataset,u)var N=u.dgst;return u=N,x=Error(t(419)),u=Au(x,u,void 0),pl(n,r,w,u)}if(N=(w&n.childLanes)!==0,zn||N){if(u=rn,u!==null){switch(w&-w){case 4:p=2;break;case 16:p=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:p=32;break;case 536870912:p=268435456;break;default:p=0}p=(p&(u.suspendedLanes|w))!==0?0:p,p!==0&&p!==x.retryLane&&(x.retryLane=p,Yi(n,p),vi(u,n,p,-1))}return Yu(),u=Au(Error(t(421))),pl(n,r,w,u)}return p.data==="$?"?(r.flags|=128,r.child=n.child,r=G_.bind(null,n),p._reactRetry=r,null):(n=x.treeContext,Yn=xr(p.nextSibling),qn=r,zt=!0,di=null,n!==null&&(ei[ti++]=ji,ei[ti++]=qi,ei[ti++]=Kr,ji=n.id,qi=n.overflow,Kr=r),r=Du(r,u.children),r.flags|=4096,r)}function im(n,r,a){n.lanes|=r;var u=n.alternate;u!==null&&(u.lanes|=r),cu(n.return,r,a)}function Nu(n,r,a,u,p){var x=n.memoizedState;x===null?n.memoizedState={isBackwards:r,rendering:null,renderingStartTime:0,last:u,tail:a,tailMode:p}:(x.isBackwards=r,x.rendering=null,x.renderingStartTime=0,x.last=u,x.tail=a,x.tailMode=p)}function rm(n,r,a){var u=r.pendingProps,p=u.revealOrder,x=u.tail;if(Tn(n,r,u.children,a),u=Bt.current,(u&2)!==0)u=u&1|2,r.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=r.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&im(n,a,r);else if(n.tag===19)im(n,a,r);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===r)break e;for(;n.sibling===null;){if(n.return===null||n.return===r)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}u&=1}if(Ut(Bt,u),(r.mode&1)===0)r.memoizedState=null;else switch(p){case"forwards":for(a=r.child,p=null;a!==null;)n=a.alternate,n!==null&&al(n)===null&&(p=a),a=a.sibling;a=p,a===null?(p=r.child,r.child=null):(p=a.sibling,a.sibling=null),Nu(r,!1,p,a,x);break;case"backwards":for(a=null,p=r.child,r.child=null;p!==null;){if(n=p.alternate,n!==null&&al(n)===null){r.child=p;break}n=p.sibling,p.sibling=a,a=p,p=n}Nu(r,!0,a,null,x);break;case"together":Nu(r,!1,null,null,void 0);break;default:r.memoizedState=null}return r.child}function ml(n,r){(r.mode&1)===0&&n!==null&&(n.alternate=null,r.alternate=null,r.flags|=2)}function $i(n,r,a){if(n!==null&&(r.dependencies=n.dependencies),es|=r.lanes,(a&r.childLanes)===0)return null;if(n!==null&&r.child!==n.child)throw Error(t(153));if(r.child!==null){for(n=r.child,a=br(n,n.pendingProps),r.child=a,a.return=r;n.sibling!==null;)n=n.sibling,a=a.sibling=br(n,n.pendingProps),a.return=r;a.sibling=null}return r.child}function L_(n,r,a){switch(r.tag){case 3:em(r),Us();break;case 5:_p(r);break;case 1:kn(r.type)&&Za(r);break;case 4:hu(r,r.stateNode.containerInfo);break;case 10:var u=r.type._context,p=r.memoizedProps.value;Ut(il,u._currentValue),u._currentValue=p;break;case 13:if(u=r.memoizedState,u!==null)return u.dehydrated!==null?(Ut(Bt,Bt.current&1),r.flags|=128,null):(a&r.child.childLanes)!==0?nm(n,r,a):(Ut(Bt,Bt.current&1),n=$i(n,r,a),n!==null?n.sibling:null);Ut(Bt,Bt.current&1);break;case 19:if(u=(a&r.childLanes)!==0,(n.flags&128)!==0){if(u)return rm(n,r,a);r.flags|=128}if(p=r.memoizedState,p!==null&&(p.rendering=null,p.tail=null,p.lastEffect=null),Ut(Bt,Bt.current),u)break;return null;case 22:case 23:return r.lanes=0,Zp(n,r,a)}return $i(n,r,a)}var sm,Iu,om,am;sm=function(n,r){for(var a=r.child;a!==null;){if(a.tag===5||a.tag===6)n.appendChild(a.stateNode);else if(a.tag!==4&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===r)break;for(;a.sibling===null;){if(a.return===null||a.return===r)return;a=a.return}a.sibling.return=a.return,a=a.sibling}},Iu=function(){},om=function(n,r,a,u){var p=n.memoizedProps;if(p!==u){n=r.stateNode,Qr(Li.current);var x=null;switch(a){case"input":p=F(n,p),u=F(n,u),x=[];break;case"select":p=oe({},p,{value:void 0}),u=oe({},u,{value:void 0}),x=[];break;case"textarea":p=C(n,p),u=C(n,u),x=[];break;default:typeof p.onClick!="function"&&typeof u.onClick=="function"&&(n.onclick=Ya)}_t(a,u);var w;a=null;for(te in p)if(!u.hasOwnProperty(te)&&p.hasOwnProperty(te)&&p[te]!=null)if(te==="style"){var N=p[te];for(w in N)N.hasOwnProperty(w)&&(a||(a={}),a[w]="")}else te!=="dangerouslySetInnerHTML"&&te!=="children"&&te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&te!=="autoFocus"&&(o.hasOwnProperty(te)?x||(x=[]):(x=x||[]).push(te,null));for(te in u){var H=u[te];if(N=p!=null?p[te]:void 0,u.hasOwnProperty(te)&&H!==N&&(H!=null||N!=null))if(te==="style")if(N){for(w in N)!N.hasOwnProperty(w)||H&&H.hasOwnProperty(w)||(a||(a={}),a[w]="");for(w in H)H.hasOwnProperty(w)&&N[w]!==H[w]&&(a||(a={}),a[w]=H[w])}else a||(x||(x=[]),x.push(te,a)),a=H;else te==="dangerouslySetInnerHTML"?(H=H?H.__html:void 0,N=N?N.__html:void 0,H!=null&&N!==H&&(x=x||[]).push(te,H)):te==="children"?typeof H!="string"&&typeof H!="number"||(x=x||[]).push(te,""+H):te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&(o.hasOwnProperty(te)?(H!=null&&te==="onScroll"&&Ot("scroll",n),x||N===H||(x=[])):(x=x||[]).push(te,H))}a&&(x=x||[]).push("style",a);var te=x;(r.updateQueue=te)&&(r.flags|=4)}},am=function(n,r,a,u){a!==u&&(r.flags|=4)};function Qo(n,r){if(!zt)switch(n.tailMode){case"hidden":r=n.tail;for(var a=null;r!==null;)r.alternate!==null&&(a=r),r=r.sibling;a===null?n.tail=null:a.sibling=null;break;case"collapsed":a=n.tail;for(var u=null;a!==null;)a.alternate!==null&&(u=a),a=a.sibling;u===null?r||n.tail===null?n.tail=null:n.tail.sibling=null:u.sibling=null}}function _n(n){var r=n.alternate!==null&&n.alternate.child===n.child,a=0,u=0;if(r)for(var p=n.child;p!==null;)a|=p.lanes|p.childLanes,u|=p.subtreeFlags&14680064,u|=p.flags&14680064,p.return=n,p=p.sibling;else for(p=n.child;p!==null;)a|=p.lanes|p.childLanes,u|=p.subtreeFlags,u|=p.flags,p.return=n,p=p.sibling;return n.subtreeFlags|=u,n.childLanes=a,r}function D_(n,r,a){var u=r.pendingProps;switch(nu(r),r.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return _n(r),null;case 1:return kn(r.type)&&$a(),_n(r),null;case 3:return u=r.stateNode,zs(),kt(On),kt(gn),mu(),u.pendingContext&&(u.context=u.pendingContext,u.pendingContext=null),(n===null||n.child===null)&&(tl(r)?r.flags|=4:n===null||n.memoizedState.isDehydrated&&(r.flags&256)===0||(r.flags|=1024,di!==null&&(Xu(di),di=null))),Iu(n,r),_n(r),null;case 5:du(r);var p=Qr(qo.current);if(a=r.type,n!==null&&r.stateNode!=null)om(n,r,a,u,p),n.ref!==r.ref&&(r.flags|=512,r.flags|=2097152);else{if(!u){if(r.stateNode===null)throw Error(t(166));return _n(r),null}if(n=Qr(Li.current),tl(r)){u=r.stateNode,a=r.type;var x=r.memoizedProps;switch(u[bi]=r,u[Vo]=x,n=(r.mode&1)!==0,a){case"dialog":Ot("cancel",u),Ot("close",u);break;case"iframe":case"object":case"embed":Ot("load",u);break;case"video":case"audio":for(p=0;p<zo.length;p++)Ot(zo[p],u);break;case"source":Ot("error",u);break;case"img":case"image":case"link":Ot("error",u),Ot("load",u);break;case"details":Ot("toggle",u);break;case"input":Qe(u,x),Ot("invalid",u);break;case"select":u._wrapperState={wasMultiple:!!x.multiple},Ot("invalid",u);break;case"textarea":$(u,x),Ot("invalid",u)}_t(a,x),p=null;for(var w in x)if(x.hasOwnProperty(w)){var N=x[w];w==="children"?typeof N=="string"?u.textContent!==N&&(x.suppressHydrationWarning!==!0&&qa(u.textContent,N,n),p=["children",N]):typeof N=="number"&&u.textContent!==""+N&&(x.suppressHydrationWarning!==!0&&qa(u.textContent,N,n),p=["children",""+N]):o.hasOwnProperty(w)&&N!=null&&w==="onScroll"&&Ot("scroll",u)}switch(a){case"input":vt(u),be(u,x,!0);break;case"textarea":vt(u),_e(u);break;case"select":case"option":break;default:typeof x.onClick=="function"&&(u.onclick=Ya)}u=p,r.updateQueue=u,u!==null&&(r.flags|=4)}else{w=p.nodeType===9?p:p.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=me(a)),n==="http://www.w3.org/1999/xhtml"?a==="script"?(n=w.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof u.is=="string"?n=w.createElement(a,{is:u.is}):(n=w.createElement(a),a==="select"&&(w=n,u.multiple?w.multiple=!0:u.size&&(w.size=u.size))):n=w.createElementNS(n,a),n[bi]=r,n[Vo]=u,sm(n,r,!1,!1),r.stateNode=n;e:{switch(w=ft(a,u),a){case"dialog":Ot("cancel",n),Ot("close",n),p=u;break;case"iframe":case"object":case"embed":Ot("load",n),p=u;break;case"video":case"audio":for(p=0;p<zo.length;p++)Ot(zo[p],n);p=u;break;case"source":Ot("error",n),p=u;break;case"img":case"image":case"link":Ot("error",n),Ot("load",n),p=u;break;case"details":Ot("toggle",n),p=u;break;case"input":Qe(n,u),p=F(n,u),Ot("invalid",n);break;case"option":p=u;break;case"select":n._wrapperState={wasMultiple:!!u.multiple},p=oe({},u,{value:void 0}),Ot("invalid",n);break;case"textarea":$(n,u),p=C(n,u),Ot("invalid",n);break;default:p=u}_t(a,p),N=p;for(x in N)if(N.hasOwnProperty(x)){var H=N[x];x==="style"?at(n,H):x==="dangerouslySetInnerHTML"?(H=H?H.__html:void 0,H!=null&&Ge(n,H)):x==="children"?typeof H=="string"?(a!=="textarea"||H!=="")&&dt(n,H):typeof H=="number"&&dt(n,""+H):x!=="suppressContentEditableWarning"&&x!=="suppressHydrationWarning"&&x!=="autoFocus"&&(o.hasOwnProperty(x)?H!=null&&x==="onScroll"&&Ot("scroll",n):H!=null&&R(n,x,H,w))}switch(a){case"input":vt(n),be(n,u,!1);break;case"textarea":vt(n),_e(n);break;case"option":u.value!=null&&n.setAttribute("value",""+Pe(u.value));break;case"select":n.multiple=!!u.multiple,x=u.value,x!=null?D(n,!!u.multiple,x,!1):u.defaultValue!=null&&D(n,!!u.multiple,u.defaultValue,!0);break;default:typeof p.onClick=="function"&&(n.onclick=Ya)}switch(a){case"button":case"input":case"select":case"textarea":u=!!u.autoFocus;break e;case"img":u=!0;break e;default:u=!1}}u&&(r.flags|=4)}r.ref!==null&&(r.flags|=512,r.flags|=2097152)}return _n(r),null;case 6:if(n&&r.stateNode!=null)am(n,r,n.memoizedProps,u);else{if(typeof u!="string"&&r.stateNode===null)throw Error(t(166));if(a=Qr(qo.current),Qr(Li.current),tl(r)){if(u=r.stateNode,a=r.memoizedProps,u[bi]=r,(x=u.nodeValue!==a)&&(n=qn,n!==null))switch(n.tag){case 3:qa(u.nodeValue,a,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&qa(u.nodeValue,a,(n.mode&1)!==0)}x&&(r.flags|=4)}else u=(a.nodeType===9?a:a.ownerDocument).createTextNode(u),u[bi]=r,r.stateNode=u}return _n(r),null;case 13:if(kt(Bt),u=r.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(zt&&Yn!==null&&(r.mode&1)!==0&&(r.flags&128)===0)up(),Us(),r.flags|=98560,x=!1;else if(x=tl(r),u!==null&&u.dehydrated!==null){if(n===null){if(!x)throw Error(t(318));if(x=r.memoizedState,x=x!==null?x.dehydrated:null,!x)throw Error(t(317));x[bi]=r}else Us(),(r.flags&128)===0&&(r.memoizedState=null),r.flags|=4;_n(r),x=!1}else di!==null&&(Xu(di),di=null),x=!0;if(!x)return r.flags&65536?r:null}return(r.flags&128)!==0?(r.lanes=a,r):(u=u!==null,u!==(n!==null&&n.memoizedState!==null)&&u&&(r.child.flags|=8192,(r.mode&1)!==0&&(n===null||(Bt.current&1)!==0?Jt===0&&(Jt=3):Yu())),r.updateQueue!==null&&(r.flags|=4),_n(r),null);case 4:return zs(),Iu(n,r),n===null&&Bo(r.stateNode.containerInfo),_n(r),null;case 10:return lu(r.type._context),_n(r),null;case 17:return kn(r.type)&&$a(),_n(r),null;case 19:if(kt(Bt),x=r.memoizedState,x===null)return _n(r),null;if(u=(r.flags&128)!==0,w=x.rendering,w===null)if(u)Qo(x,!1);else{if(Jt!==0||n!==null&&(n.flags&128)!==0)for(n=r.child;n!==null;){if(w=al(n),w!==null){for(r.flags|=128,Qo(x,!1),u=w.updateQueue,u!==null&&(r.updateQueue=u,r.flags|=4),r.subtreeFlags=0,u=a,a=r.child;a!==null;)x=a,n=u,x.flags&=14680066,w=x.alternate,w===null?(x.childLanes=0,x.lanes=n,x.child=null,x.subtreeFlags=0,x.memoizedProps=null,x.memoizedState=null,x.updateQueue=null,x.dependencies=null,x.stateNode=null):(x.childLanes=w.childLanes,x.lanes=w.lanes,x.child=w.child,x.subtreeFlags=0,x.deletions=null,x.memoizedProps=w.memoizedProps,x.memoizedState=w.memoizedState,x.updateQueue=w.updateQueue,x.type=w.type,n=w.dependencies,x.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),a=a.sibling;return Ut(Bt,Bt.current&1|2),r.child}n=n.sibling}x.tail!==null&&Te()>Gs&&(r.flags|=128,u=!0,Qo(x,!1),r.lanes=4194304)}else{if(!u)if(n=al(w),n!==null){if(r.flags|=128,u=!0,a=n.updateQueue,a!==null&&(r.updateQueue=a,r.flags|=4),Qo(x,!0),x.tail===null&&x.tailMode==="hidden"&&!w.alternate&&!zt)return _n(r),null}else 2*Te()-x.renderingStartTime>Gs&&a!==1073741824&&(r.flags|=128,u=!0,Qo(x,!1),r.lanes=4194304);x.isBackwards?(w.sibling=r.child,r.child=w):(a=x.last,a!==null?a.sibling=w:r.child=w,x.last=w)}return x.tail!==null?(r=x.tail,x.rendering=r,x.tail=r.sibling,x.renderingStartTime=Te(),r.sibling=null,a=Bt.current,Ut(Bt,u?a&1|2:a&1),r):(_n(r),null);case 22:case 23:return qu(),u=r.memoizedState!==null,n!==null&&n.memoizedState!==null!==u&&(r.flags|=8192),u&&(r.mode&1)!==0?(Kn&1073741824)!==0&&(_n(r),r.subtreeFlags&6&&(r.flags|=8192)):_n(r),null;case 24:return null;case 25:return null}throw Error(t(156,r.tag))}function N_(n,r){switch(nu(r),r.tag){case 1:return kn(r.type)&&$a(),n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 3:return zs(),kt(On),kt(gn),mu(),n=r.flags,(n&65536)!==0&&(n&128)===0?(r.flags=n&-65537|128,r):null;case 5:return du(r),null;case 13:if(kt(Bt),n=r.memoizedState,n!==null&&n.dehydrated!==null){if(r.alternate===null)throw Error(t(340));Us()}return n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 19:return kt(Bt),null;case 4:return zs(),null;case 10:return lu(r.type._context),null;case 22:case 23:return qu(),null;case 24:return null;default:return null}}var gl=!1,xn=!1,I_=typeof WeakSet=="function"?WeakSet:Set,We=null;function Hs(n,r){var a=n.ref;if(a!==null)if(typeof a=="function")try{a(null)}catch(u){Wt(n,r,u)}else a.current=null}function Uu(n,r,a){try{a()}catch(u){Wt(n,r,u)}}var lm=!1;function U_(n,r){if(qc=Fa,n=Bd(),zc(n)){if("selectionStart"in n)var a={start:n.selectionStart,end:n.selectionEnd};else e:{a=(a=n.ownerDocument)&&a.defaultView||window;var u=a.getSelection&&a.getSelection();if(u&&u.rangeCount!==0){a=u.anchorNode;var p=u.anchorOffset,x=u.focusNode;u=u.focusOffset;try{a.nodeType,x.nodeType}catch{a=null;break e}var w=0,N=-1,H=-1,te=0,ye=0,Se=n,xe=null;t:for(;;){for(var Be;Se!==a||p!==0&&Se.nodeType!==3||(N=w+p),Se!==x||u!==0&&Se.nodeType!==3||(H=w+u),Se.nodeType===3&&(w+=Se.nodeValue.length),(Be=Se.firstChild)!==null;)xe=Se,Se=Be;for(;;){if(Se===n)break t;if(xe===a&&++te===p&&(N=w),xe===x&&++ye===u&&(H=w),(Be=Se.nextSibling)!==null)break;Se=xe,xe=Se.parentNode}Se=Be}a=N===-1||H===-1?null:{start:N,end:H}}else a=null}a=a||{start:0,end:0}}else a=null;for(Yc={focusedElem:n,selectionRange:a},Fa=!1,We=r;We!==null;)if(r=We,n=r.child,(r.subtreeFlags&1028)!==0&&n!==null)n.return=r,We=n;else for(;We!==null;){r=We;try{var qe=r.alternate;if((r.flags&1024)!==0)switch(r.tag){case 0:case 11:case 15:break;case 1:if(qe!==null){var $e=qe.memoizedProps,jt=qe.memoizedState,K=r.stateNode,W=K.getSnapshotBeforeUpdate(r.elementType===r.type?$e:pi(r.type,$e),jt);K.__reactInternalSnapshotBeforeUpdate=W}break;case 3:var Z=r.stateNode.containerInfo;Z.nodeType===1?Z.textContent="":Z.nodeType===9&&Z.documentElement&&Z.removeChild(Z.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Ce){Wt(r,r.return,Ce)}if(n=r.sibling,n!==null){n.return=r.return,We=n;break}We=r.return}return qe=lm,lm=!1,qe}function Jo(n,r,a){var u=r.updateQueue;if(u=u!==null?u.lastEffect:null,u!==null){var p=u=u.next;do{if((p.tag&n)===n){var x=p.destroy;p.destroy=void 0,x!==void 0&&Uu(r,a,x)}p=p.next}while(p!==u)}}function vl(n,r){if(r=r.updateQueue,r=r!==null?r.lastEffect:null,r!==null){var a=r=r.next;do{if((a.tag&n)===n){var u=a.create;a.destroy=u()}a=a.next}while(a!==r)}}function Fu(n){var r=n.ref;if(r!==null){var a=n.stateNode;switch(n.tag){case 5:n=a;break;default:n=a}typeof r=="function"?r(n):r.current=n}}function cm(n){var r=n.alternate;r!==null&&(n.alternate=null,cm(r)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(r=n.stateNode,r!==null&&(delete r[bi],delete r[Vo],delete r[Qc],delete r[v_],delete r[__])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function um(n){return n.tag===5||n.tag===3||n.tag===4}function fm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||um(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function Ou(n,r,a){var u=n.tag;if(u===5||u===6)n=n.stateNode,r?a.nodeType===8?a.parentNode.insertBefore(n,r):a.insertBefore(n,r):(a.nodeType===8?(r=a.parentNode,r.insertBefore(n,a)):(r=a,r.appendChild(n)),a=a._reactRootContainer,a!=null||r.onclick!==null||(r.onclick=Ya));else if(u!==4&&(n=n.child,n!==null))for(Ou(n,r,a),n=n.sibling;n!==null;)Ou(n,r,a),n=n.sibling}function ku(n,r,a){var u=n.tag;if(u===5||u===6)n=n.stateNode,r?a.insertBefore(n,r):a.appendChild(n);else if(u!==4&&(n=n.child,n!==null))for(ku(n,r,a),n=n.sibling;n!==null;)ku(n,r,a),n=n.sibling}var ln=null,mi=!1;function Tr(n,r,a){for(a=a.child;a!==null;)hm(n,r,a),a=a.sibling}function hm(n,r,a){if(yt&&typeof yt.onCommitFiberUnmount=="function")try{yt.onCommitFiberUnmount(Pt,a)}catch{}switch(a.tag){case 5:xn||Hs(a,r);case 6:var u=ln,p=mi;ln=null,Tr(n,r,a),ln=u,mi=p,ln!==null&&(mi?(n=ln,a=a.stateNode,n.nodeType===8?n.parentNode.removeChild(a):n.removeChild(a)):ln.removeChild(a.stateNode));break;case 18:ln!==null&&(mi?(n=ln,a=a.stateNode,n.nodeType===8?Zc(n.parentNode,a):n.nodeType===1&&Zc(n,a),Lo(n)):Zc(ln,a.stateNode));break;case 4:u=ln,p=mi,ln=a.stateNode.containerInfo,mi=!0,Tr(n,r,a),ln=u,mi=p;break;case 0:case 11:case 14:case 15:if(!xn&&(u=a.updateQueue,u!==null&&(u=u.lastEffect,u!==null))){p=u=u.next;do{var x=p,w=x.destroy;x=x.tag,w!==void 0&&((x&2)!==0||(x&4)!==0)&&Uu(a,r,w),p=p.next}while(p!==u)}Tr(n,r,a);break;case 1:if(!xn&&(Hs(a,r),u=a.stateNode,typeof u.componentWillUnmount=="function"))try{u.props=a.memoizedProps,u.state=a.memoizedState,u.componentWillUnmount()}catch(N){Wt(a,r,N)}Tr(n,r,a);break;case 21:Tr(n,r,a);break;case 22:a.mode&1?(xn=(u=xn)||a.memoizedState!==null,Tr(n,r,a),xn=u):Tr(n,r,a);break;default:Tr(n,r,a)}}function dm(n){var r=n.updateQueue;if(r!==null){n.updateQueue=null;var a=n.stateNode;a===null&&(a=n.stateNode=new I_),r.forEach(function(u){var p=W_.bind(null,n,u);a.has(u)||(a.add(u),u.then(p,p))})}}function gi(n,r){var a=r.deletions;if(a!==null)for(var u=0;u<a.length;u++){var p=a[u];try{var x=n,w=r,N=w;e:for(;N!==null;){switch(N.tag){case 5:ln=N.stateNode,mi=!1;break e;case 3:ln=N.stateNode.containerInfo,mi=!0;break e;case 4:ln=N.stateNode.containerInfo,mi=!0;break e}N=N.return}if(ln===null)throw Error(t(160));hm(x,w,p),ln=null,mi=!1;var H=p.alternate;H!==null&&(H.return=null),p.return=null}catch(te){Wt(p,r,te)}}if(r.subtreeFlags&12854)for(r=r.child;r!==null;)pm(r,n),r=r.sibling}function pm(n,r){var a=n.alternate,u=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(gi(r,n),Ni(n),u&4){try{Jo(3,n,n.return),vl(3,n)}catch($e){Wt(n,n.return,$e)}try{Jo(5,n,n.return)}catch($e){Wt(n,n.return,$e)}}break;case 1:gi(r,n),Ni(n),u&512&&a!==null&&Hs(a,a.return);break;case 5:if(gi(r,n),Ni(n),u&512&&a!==null&&Hs(a,a.return),n.flags&32){var p=n.stateNode;try{dt(p,"")}catch($e){Wt(n,n.return,$e)}}if(u&4&&(p=n.stateNode,p!=null)){var x=n.memoizedProps,w=a!==null?a.memoizedProps:x,N=n.type,H=n.updateQueue;if(n.updateQueue=null,H!==null)try{N==="input"&&x.type==="radio"&&x.name!=null&&Ee(p,x),ft(N,w);var te=ft(N,x);for(w=0;w<H.length;w+=2){var ye=H[w],Se=H[w+1];ye==="style"?at(p,Se):ye==="dangerouslySetInnerHTML"?Ge(p,Se):ye==="children"?dt(p,Se):R(p,ye,Se,te)}switch(N){case"input":Ve(p,x);break;case"textarea":pe(p,x);break;case"select":var xe=p._wrapperState.wasMultiple;p._wrapperState.wasMultiple=!!x.multiple;var Be=x.value;Be!=null?D(p,!!x.multiple,Be,!1):xe!==!!x.multiple&&(x.defaultValue!=null?D(p,!!x.multiple,x.defaultValue,!0):D(p,!!x.multiple,x.multiple?[]:"",!1))}p[Vo]=x}catch($e){Wt(n,n.return,$e)}}break;case 6:if(gi(r,n),Ni(n),u&4){if(n.stateNode===null)throw Error(t(162));p=n.stateNode,x=n.memoizedProps;try{p.nodeValue=x}catch($e){Wt(n,n.return,$e)}}break;case 3:if(gi(r,n),Ni(n),u&4&&a!==null&&a.memoizedState.isDehydrated)try{Lo(r.containerInfo)}catch($e){Wt(n,n.return,$e)}break;case 4:gi(r,n),Ni(n);break;case 13:gi(r,n),Ni(n),p=n.child,p.flags&8192&&(x=p.memoizedState!==null,p.stateNode.isHidden=x,!x||p.alternate!==null&&p.alternate.memoizedState!==null||(Hu=Te())),u&4&&dm(n);break;case 22:if(ye=a!==null&&a.memoizedState!==null,n.mode&1?(xn=(te=xn)||ye,gi(r,n),xn=te):gi(r,n),Ni(n),u&8192){if(te=n.memoizedState!==null,(n.stateNode.isHidden=te)&&!ye&&(n.mode&1)!==0)for(We=n,ye=n.child;ye!==null;){for(Se=We=ye;We!==null;){switch(xe=We,Be=xe.child,xe.tag){case 0:case 11:case 14:case 15:Jo(4,xe,xe.return);break;case 1:Hs(xe,xe.return);var qe=xe.stateNode;if(typeof qe.componentWillUnmount=="function"){u=xe,a=xe.return;try{r=u,qe.props=r.memoizedProps,qe.state=r.memoizedState,qe.componentWillUnmount()}catch($e){Wt(u,a,$e)}}break;case 5:Hs(xe,xe.return);break;case 22:if(xe.memoizedState!==null){vm(Se);continue}}Be!==null?(Be.return=xe,We=Be):vm(Se)}ye=ye.sibling}e:for(ye=null,Se=n;;){if(Se.tag===5){if(ye===null){ye=Se;try{p=Se.stateNode,te?(x=p.style,typeof x.setProperty=="function"?x.setProperty("display","none","important"):x.display="none"):(N=Se.stateNode,H=Se.memoizedProps.style,w=H!=null&&H.hasOwnProperty("display")?H.display:null,N.style.display=ot("display",w))}catch($e){Wt(n,n.return,$e)}}}else if(Se.tag===6){if(ye===null)try{Se.stateNode.nodeValue=te?"":Se.memoizedProps}catch($e){Wt(n,n.return,$e)}}else if((Se.tag!==22&&Se.tag!==23||Se.memoizedState===null||Se===n)&&Se.child!==null){Se.child.return=Se,Se=Se.child;continue}if(Se===n)break e;for(;Se.sibling===null;){if(Se.return===null||Se.return===n)break e;ye===Se&&(ye=null),Se=Se.return}ye===Se&&(ye=null),Se.sibling.return=Se.return,Se=Se.sibling}}break;case 19:gi(r,n),Ni(n),u&4&&dm(n);break;case 21:break;default:gi(r,n),Ni(n)}}function Ni(n){var r=n.flags;if(r&2){try{e:{for(var a=n.return;a!==null;){if(um(a)){var u=a;break e}a=a.return}throw Error(t(160))}switch(u.tag){case 5:var p=u.stateNode;u.flags&32&&(dt(p,""),u.flags&=-33);var x=fm(n);ku(n,x,p);break;case 3:case 4:var w=u.stateNode.containerInfo,N=fm(n);Ou(n,N,w);break;default:throw Error(t(161))}}catch(H){Wt(n,n.return,H)}n.flags&=-3}r&4096&&(n.flags&=-4097)}function F_(n,r,a){We=n,mm(n)}function mm(n,r,a){for(var u=(n.mode&1)!==0;We!==null;){var p=We,x=p.child;if(p.tag===22&&u){var w=p.memoizedState!==null||gl;if(!w){var N=p.alternate,H=N!==null&&N.memoizedState!==null||xn;N=gl;var te=xn;if(gl=w,(xn=H)&&!te)for(We=p;We!==null;)w=We,H=w.child,w.tag===22&&w.memoizedState!==null?_m(p):H!==null?(H.return=w,We=H):_m(p);for(;x!==null;)We=x,mm(x),x=x.sibling;We=p,gl=N,xn=te}gm(n)}else(p.subtreeFlags&8772)!==0&&x!==null?(x.return=p,We=x):gm(n)}}function gm(n){for(;We!==null;){var r=We;if((r.flags&8772)!==0){var a=r.alternate;try{if((r.flags&8772)!==0)switch(r.tag){case 0:case 11:case 15:xn||vl(5,r);break;case 1:var u=r.stateNode;if(r.flags&4&&!xn)if(a===null)u.componentDidMount();else{var p=r.elementType===r.type?a.memoizedProps:pi(r.type,a.memoizedProps);u.componentDidUpdate(p,a.memoizedState,u.__reactInternalSnapshotBeforeUpdate)}var x=r.updateQueue;x!==null&&vp(r,x,u);break;case 3:var w=r.updateQueue;if(w!==null){if(a=null,r.child!==null)switch(r.child.tag){case 5:a=r.child.stateNode;break;case 1:a=r.child.stateNode}vp(r,w,a)}break;case 5:var N=r.stateNode;if(a===null&&r.flags&4){a=N;var H=r.memoizedProps;switch(r.type){case"button":case"input":case"select":case"textarea":H.autoFocus&&a.focus();break;case"img":H.src&&(a.src=H.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(r.memoizedState===null){var te=r.alternate;if(te!==null){var ye=te.memoizedState;if(ye!==null){var Se=ye.dehydrated;Se!==null&&Lo(Se)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}xn||r.flags&512&&Fu(r)}catch(xe){Wt(r,r.return,xe)}}if(r===n){We=null;break}if(a=r.sibling,a!==null){a.return=r.return,We=a;break}We=r.return}}function vm(n){for(;We!==null;){var r=We;if(r===n){We=null;break}var a=r.sibling;if(a!==null){a.return=r.return,We=a;break}We=r.return}}function _m(n){for(;We!==null;){var r=We;try{switch(r.tag){case 0:case 11:case 15:var a=r.return;try{vl(4,r)}catch(H){Wt(r,a,H)}break;case 1:var u=r.stateNode;if(typeof u.componentDidMount=="function"){var p=r.return;try{u.componentDidMount()}catch(H){Wt(r,p,H)}}var x=r.return;try{Fu(r)}catch(H){Wt(r,x,H)}break;case 5:var w=r.return;try{Fu(r)}catch(H){Wt(r,w,H)}}}catch(H){Wt(r,r.return,H)}if(r===n){We=null;break}var N=r.sibling;if(N!==null){N.return=r.return,We=N;break}We=r.return}}var O_=Math.ceil,_l=T.ReactCurrentDispatcher,zu=T.ReactCurrentOwner,ri=T.ReactCurrentBatchConfig,wt=0,rn=null,Yt=null,cn=0,Kn=0,Vs=yr(0),Jt=0,ea=null,es=0,xl=0,Bu=0,ta=null,Bn=null,Hu=0,Gs=1/0,Zi=null,yl=!1,Vu=null,Ar=null,Sl=!1,Cr=null,Ml=0,na=0,Gu=null,El=-1,wl=0;function An(){return(wt&6)!==0?Te():El!==-1?El:El=Te()}function Rr(n){return(n.mode&1)===0?1:(wt&2)!==0&&cn!==0?cn&-cn:y_.transition!==null?(wl===0&&(wl=wn()),wl):(n=Lt,n!==0||(n=window.event,n=n===void 0?16:yd(n.type)),n)}function vi(n,r,a,u){if(50<na)throw na=0,Gu=null,Error(t(185));Fn(n,a,u),((wt&2)===0||n!==rn)&&(n===rn&&((wt&2)===0&&(xl|=a),Jt===4&&Pr(n,cn)),Hn(n,u),a===1&&wt===0&&(r.mode&1)===0&&(Gs=Te()+500,Qa&&Mr()))}function Hn(n,r){var a=n.callbackNode;Qn(n,r);var u=Pi(n,n===rn?cn:0);if(u===0)a!==null&&re(a),n.callbackNode=null,n.callbackPriority=0;else if(r=u&-u,n.callbackPriority!==r){if(a!=null&&re(a),r===1)n.tag===0?x_(ym.bind(null,n)):sp(ym.bind(null,n)),m_(function(){(wt&6)===0&&Mr()}),a=null;else{switch(hd(u)){case 1:a=Ke;break;case 4:a=lt;break;case 16:a=ut;break;case 536870912:a=St;break;default:a=ut}a=Rm(a,xm.bind(null,n))}n.callbackPriority=r,n.callbackNode=a}}function xm(n,r){if(El=-1,wl=0,(wt&6)!==0)throw Error(t(327));var a=n.callbackNode;if(Ws()&&n.callbackNode!==a)return null;var u=Pi(n,n===rn?cn:0);if(u===0)return null;if((u&30)!==0||(u&n.expiredLanes)!==0||r)r=Tl(n,u);else{r=u;var p=wt;wt|=2;var x=Mm();(rn!==n||cn!==r)&&(Zi=null,Gs=Te()+500,ns(n,r));do try{B_();break}catch(N){Sm(n,N)}while(!0);au(),_l.current=x,wt=p,Yt!==null?r=0:(rn=null,cn=0,r=Jt)}if(r!==0){if(r===2&&(p=Gi(n),p!==0&&(u=p,r=Wu(n,p))),r===1)throw a=ea,ns(n,0),Pr(n,u),Hn(n,Te()),a;if(r===6)Pr(n,u);else{if(p=n.current.alternate,(u&30)===0&&!k_(p)&&(r=Tl(n,u),r===2&&(x=Gi(n),x!==0&&(u=x,r=Wu(n,x))),r===1))throw a=ea,ns(n,0),Pr(n,u),Hn(n,Te()),a;switch(n.finishedWork=p,n.finishedLanes=u,r){case 0:case 1:throw Error(t(345));case 2:is(n,Bn,Zi);break;case 3:if(Pr(n,u),(u&130023424)===u&&(r=Hu+500-Te(),10<r)){if(Pi(n,0)!==0)break;if(p=n.suspendedLanes,(p&u)!==u){An(),n.pingedLanes|=n.suspendedLanes&p;break}n.timeoutHandle=$c(is.bind(null,n,Bn,Zi),r);break}is(n,Bn,Zi);break;case 4:if(Pr(n,u),(u&4194240)===u)break;for(r=n.eventTimes,p=-1;0<u;){var w=31-pt(u);x=1<<w,w=r[w],w>p&&(p=w),u&=~x}if(u=p,u=Te()-u,u=(120>u?120:480>u?480:1080>u?1080:1920>u?1920:3e3>u?3e3:4320>u?4320:1960*O_(u/1960))-u,10<u){n.timeoutHandle=$c(is.bind(null,n,Bn,Zi),u);break}is(n,Bn,Zi);break;case 5:is(n,Bn,Zi);break;default:throw Error(t(329))}}}return Hn(n,Te()),n.callbackNode===a?xm.bind(null,n):null}function Wu(n,r){var a=ta;return n.current.memoizedState.isDehydrated&&(ns(n,r).flags|=256),n=Tl(n,r),n!==2&&(r=Bn,Bn=a,r!==null&&Xu(r)),n}function Xu(n){Bn===null?Bn=n:Bn.push.apply(Bn,n)}function k_(n){for(var r=n;;){if(r.flags&16384){var a=r.updateQueue;if(a!==null&&(a=a.stores,a!==null))for(var u=0;u<a.length;u++){var p=a[u],x=p.getSnapshot;p=p.value;try{if(!hi(x(),p))return!1}catch{return!1}}}if(a=r.child,r.subtreeFlags&16384&&a!==null)a.return=r,r=a;else{if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return!0;r=r.return}r.sibling.return=r.return,r=r.sibling}}return!0}function Pr(n,r){for(r&=~Bu,r&=~xl,n.suspendedLanes|=r,n.pingedLanes&=~r,n=n.expirationTimes;0<r;){var a=31-pt(r),u=1<<a;n[a]=-1,r&=~u}}function ym(n){if((wt&6)!==0)throw Error(t(327));Ws();var r=Pi(n,0);if((r&1)===0)return Hn(n,Te()),null;var a=Tl(n,r);if(n.tag!==0&&a===2){var u=Gi(n);u!==0&&(r=u,a=Wu(n,u))}if(a===1)throw a=ea,ns(n,0),Pr(n,r),Hn(n,Te()),a;if(a===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=r,is(n,Bn,Zi),Hn(n,Te()),null}function ju(n,r){var a=wt;wt|=1;try{return n(r)}finally{wt=a,wt===0&&(Gs=Te()+500,Qa&&Mr())}}function ts(n){Cr!==null&&Cr.tag===0&&(wt&6)===0&&Ws();var r=wt;wt|=1;var a=ri.transition,u=Lt;try{if(ri.transition=null,Lt=1,n)return n()}finally{Lt=u,ri.transition=a,wt=r,(wt&6)===0&&Mr()}}function qu(){Kn=Vs.current,kt(Vs)}function ns(n,r){n.finishedWork=null,n.finishedLanes=0;var a=n.timeoutHandle;if(a!==-1&&(n.timeoutHandle=-1,p_(a)),Yt!==null)for(a=Yt.return;a!==null;){var u=a;switch(nu(u),u.tag){case 1:u=u.type.childContextTypes,u!=null&&$a();break;case 3:zs(),kt(On),kt(gn),mu();break;case 5:du(u);break;case 4:zs();break;case 13:kt(Bt);break;case 19:kt(Bt);break;case 10:lu(u.type._context);break;case 22:case 23:qu()}a=a.return}if(rn=n,Yt=n=br(n.current,null),cn=Kn=r,Jt=0,ea=null,Bu=xl=es=0,Bn=ta=null,Zr!==null){for(r=0;r<Zr.length;r++)if(a=Zr[r],u=a.interleaved,u!==null){a.interleaved=null;var p=u.next,x=a.pending;if(x!==null){var w=x.next;x.next=p,u.next=w}a.pending=u}Zr=null}return n}function Sm(n,r){do{var a=Yt;try{if(au(),ll.current=hl,cl){for(var u=Ht.memoizedState;u!==null;){var p=u.queue;p!==null&&(p.pending=null),u=u.next}cl=!1}if(Jr=0,nn=Qt=Ht=null,Yo=!1,Ko=0,zu.current=null,a===null||a.return===null){Jt=1,ea=r,Yt=null;break}e:{var x=n,w=a.return,N=a,H=r;if(r=cn,N.flags|=32768,H!==null&&typeof H=="object"&&typeof H.then=="function"){var te=H,ye=N,Se=ye.tag;if((ye.mode&1)===0&&(Se===0||Se===11||Se===15)){var xe=ye.alternate;xe?(ye.updateQueue=xe.updateQueue,ye.memoizedState=xe.memoizedState,ye.lanes=xe.lanes):(ye.updateQueue=null,ye.memoizedState=null)}var Be=jp(w);if(Be!==null){Be.flags&=-257,qp(Be,w,N,x,r),Be.mode&1&&Xp(x,te,r),r=Be,H=te;var qe=r.updateQueue;if(qe===null){var $e=new Set;$e.add(H),r.updateQueue=$e}else qe.add(H);break e}else{if((r&1)===0){Xp(x,te,r),Yu();break e}H=Error(t(426))}}else if(zt&&N.mode&1){var jt=jp(w);if(jt!==null){(jt.flags&65536)===0&&(jt.flags|=256),qp(jt,w,N,x,r),su(Bs(H,N));break e}}x=H=Bs(H,N),Jt!==4&&(Jt=2),ta===null?ta=[x]:ta.push(x),x=w;do{switch(x.tag){case 3:x.flags|=65536,r&=-r,x.lanes|=r;var K=Gp(x,H,r);gp(x,K);break e;case 1:N=H;var W=x.type,Z=x.stateNode;if((x.flags&128)===0&&(typeof W.getDerivedStateFromError=="function"||Z!==null&&typeof Z.componentDidCatch=="function"&&(Ar===null||!Ar.has(Z)))){x.flags|=65536,r&=-r,x.lanes|=r;var Ce=Wp(x,N,r);gp(x,Ce);break e}}x=x.return}while(x!==null)}wm(a)}catch(tt){r=tt,Yt===a&&a!==null&&(Yt=a=a.return);continue}break}while(!0)}function Mm(){var n=_l.current;return _l.current=hl,n===null?hl:n}function Yu(){(Jt===0||Jt===3||Jt===2)&&(Jt=4),rn===null||(es&268435455)===0&&(xl&268435455)===0||Pr(rn,cn)}function Tl(n,r){var a=wt;wt|=2;var u=Mm();(rn!==n||cn!==r)&&(Zi=null,ns(n,r));do try{z_();break}catch(p){Sm(n,p)}while(!0);if(au(),wt=a,_l.current=u,Yt!==null)throw Error(t(261));return rn=null,cn=0,Jt}function z_(){for(;Yt!==null;)Em(Yt)}function B_(){for(;Yt!==null&&!q();)Em(Yt)}function Em(n){var r=Cm(n.alternate,n,Kn);n.memoizedProps=n.pendingProps,r===null?wm(n):Yt=r,zu.current=null}function wm(n){var r=n;do{var a=r.alternate;if(n=r.return,(r.flags&32768)===0){if(a=D_(a,r,Kn),a!==null){Yt=a;return}}else{if(a=N_(a,r),a!==null){a.flags&=32767,Yt=a;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{Jt=6,Yt=null;return}}if(r=r.sibling,r!==null){Yt=r;return}Yt=r=n}while(r!==null);Jt===0&&(Jt=5)}function is(n,r,a){var u=Lt,p=ri.transition;try{ri.transition=null,Lt=1,H_(n,r,a,u)}finally{ri.transition=p,Lt=u}return null}function H_(n,r,a,u){do Ws();while(Cr!==null);if((wt&6)!==0)throw Error(t(327));a=n.finishedWork;var p=n.finishedLanes;if(a===null)return null;if(n.finishedWork=null,n.finishedLanes=0,a===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var x=a.lanes|a.childLanes;if(Na(n,x),n===rn&&(Yt=rn=null,cn=0),(a.subtreeFlags&2064)===0&&(a.flags&2064)===0||Sl||(Sl=!0,Rm(ut,function(){return Ws(),null})),x=(a.flags&15990)!==0,(a.subtreeFlags&15990)!==0||x){x=ri.transition,ri.transition=null;var w=Lt;Lt=1;var N=wt;wt|=4,zu.current=null,U_(n,a),pm(a,n),a_(Yc),Fa=!!qc,Yc=qc=null,n.current=a,F_(a),Re(),wt=N,Lt=w,ri.transition=x}else n.current=a;if(Sl&&(Sl=!1,Cr=n,Ml=p),x=n.pendingLanes,x===0&&(Ar=null),pn(a.stateNode),Hn(n,Te()),r!==null)for(u=n.onRecoverableError,a=0;a<r.length;a++)p=r[a],u(p.value,{componentStack:p.stack,digest:p.digest});if(yl)throw yl=!1,n=Vu,Vu=null,n;return(Ml&1)!==0&&n.tag!==0&&Ws(),x=n.pendingLanes,(x&1)!==0?n===Gu?na++:(na=0,Gu=n):na=0,Mr(),null}function Ws(){if(Cr!==null){var n=hd(Ml),r=ri.transition,a=Lt;try{if(ri.transition=null,Lt=16>n?16:n,Cr===null)var u=!1;else{if(n=Cr,Cr=null,Ml=0,(wt&6)!==0)throw Error(t(331));var p=wt;for(wt|=4,We=n.current;We!==null;){var x=We,w=x.child;if((We.flags&16)!==0){var N=x.deletions;if(N!==null){for(var H=0;H<N.length;H++){var te=N[H];for(We=te;We!==null;){var ye=We;switch(ye.tag){case 0:case 11:case 15:Jo(8,ye,x)}var Se=ye.child;if(Se!==null)Se.return=ye,We=Se;else for(;We!==null;){ye=We;var xe=ye.sibling,Be=ye.return;if(cm(ye),ye===te){We=null;break}if(xe!==null){xe.return=Be,We=xe;break}We=Be}}}var qe=x.alternate;if(qe!==null){var $e=qe.child;if($e!==null){qe.child=null;do{var jt=$e.sibling;$e.sibling=null,$e=jt}while($e!==null)}}We=x}}if((x.subtreeFlags&2064)!==0&&w!==null)w.return=x,We=w;else e:for(;We!==null;){if(x=We,(x.flags&2048)!==0)switch(x.tag){case 0:case 11:case 15:Jo(9,x,x.return)}var K=x.sibling;if(K!==null){K.return=x.return,We=K;break e}We=x.return}}var W=n.current;for(We=W;We!==null;){w=We;var Z=w.child;if((w.subtreeFlags&2064)!==0&&Z!==null)Z.return=w,We=Z;else e:for(w=W;We!==null;){if(N=We,(N.flags&2048)!==0)try{switch(N.tag){case 0:case 11:case 15:vl(9,N)}}catch(tt){Wt(N,N.return,tt)}if(N===w){We=null;break e}var Ce=N.sibling;if(Ce!==null){Ce.return=N.return,We=Ce;break e}We=N.return}}if(wt=p,Mr(),yt&&typeof yt.onPostCommitFiberRoot=="function")try{yt.onPostCommitFiberRoot(Pt,n)}catch{}u=!0}return u}finally{Lt=a,ri.transition=r}}return!1}function Tm(n,r,a){r=Bs(a,r),r=Gp(n,r,1),n=wr(n,r,1),r=An(),n!==null&&(Fn(n,1,r),Hn(n,r))}function Wt(n,r,a){if(n.tag===3)Tm(n,n,a);else for(;r!==null;){if(r.tag===3){Tm(r,n,a);break}else if(r.tag===1){var u=r.stateNode;if(typeof r.type.getDerivedStateFromError=="function"||typeof u.componentDidCatch=="function"&&(Ar===null||!Ar.has(u))){n=Bs(a,n),n=Wp(r,n,1),r=wr(r,n,1),n=An(),r!==null&&(Fn(r,1,n),Hn(r,n));break}}r=r.return}}function V_(n,r,a){var u=n.pingCache;u!==null&&u.delete(r),r=An(),n.pingedLanes|=n.suspendedLanes&a,rn===n&&(cn&a)===a&&(Jt===4||Jt===3&&(cn&130023424)===cn&&500>Te()-Hu?ns(n,0):Bu|=a),Hn(n,r)}function Am(n,r){r===0&&((n.mode&1)===0?r=1:(r=fi,fi<<=1,(fi&130023424)===0&&(fi=4194304)));var a=An();n=Yi(n,r),n!==null&&(Fn(n,r,a),Hn(n,a))}function G_(n){var r=n.memoizedState,a=0;r!==null&&(a=r.retryLane),Am(n,a)}function W_(n,r){var a=0;switch(n.tag){case 13:var u=n.stateNode,p=n.memoizedState;p!==null&&(a=p.retryLane);break;case 19:u=n.stateNode;break;default:throw Error(t(314))}u!==null&&u.delete(r),Am(n,a)}var Cm;Cm=function(n,r,a){if(n!==null)if(n.memoizedProps!==r.pendingProps||On.current)zn=!0;else{if((n.lanes&a)===0&&(r.flags&128)===0)return zn=!1,L_(n,r,a);zn=(n.flags&131072)!==0}else zn=!1,zt&&(r.flags&1048576)!==0&&op(r,el,r.index);switch(r.lanes=0,r.tag){case 2:var u=r.type;ml(n,r),n=r.pendingProps;var p=Ds(r,gn.current);ks(r,a),p=_u(null,r,u,n,p,a);var x=xu();return r.flags|=1,typeof p=="object"&&p!==null&&typeof p.render=="function"&&p.$$typeof===void 0?(r.tag=1,r.memoizedState=null,r.updateQueue=null,kn(u)?(x=!0,Za(r)):x=!1,r.memoizedState=p.state!==null&&p.state!==void 0?p.state:null,fu(r),p.updater=dl,r.stateNode=p,p._reactInternals=r,Tu(r,u,n,a),r=Pu(null,r,u,!0,x,a)):(r.tag=0,zt&&x&&tu(r),Tn(null,r,p,a),r=r.child),r;case 16:u=r.elementType;e:{switch(ml(n,r),n=r.pendingProps,p=u._init,u=p(u._payload),r.type=u,p=r.tag=j_(u),n=pi(u,n),p){case 0:r=Ru(null,r,u,n,a);break e;case 1:r=Jp(null,r,u,n,a);break e;case 11:r=Yp(null,r,u,n,a);break e;case 14:r=Kp(null,r,u,pi(u.type,n),a);break e}throw Error(t(306,u,""))}return r;case 0:return u=r.type,p=r.pendingProps,p=r.elementType===u?p:pi(u,p),Ru(n,r,u,p,a);case 1:return u=r.type,p=r.pendingProps,p=r.elementType===u?p:pi(u,p),Jp(n,r,u,p,a);case 3:e:{if(em(r),n===null)throw Error(t(387));u=r.pendingProps,x=r.memoizedState,p=x.element,mp(n,r),ol(r,u,null,a);var w=r.memoizedState;if(u=w.element,x.isDehydrated)if(x={element:u,isDehydrated:!1,cache:w.cache,pendingSuspenseBoundaries:w.pendingSuspenseBoundaries,transitions:w.transitions},r.updateQueue.baseState=x,r.memoizedState=x,r.flags&256){p=Bs(Error(t(423)),r),r=tm(n,r,u,a,p);break e}else if(u!==p){p=Bs(Error(t(424)),r),r=tm(n,r,u,a,p);break e}else for(Yn=xr(r.stateNode.containerInfo.firstChild),qn=r,zt=!0,di=null,a=dp(r,null,u,a),r.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Us(),u===p){r=$i(n,r,a);break e}Tn(n,r,u,a)}r=r.child}return r;case 5:return _p(r),n===null&&ru(r),u=r.type,p=r.pendingProps,x=n!==null?n.memoizedProps:null,w=p.children,Kc(u,p)?w=null:x!==null&&Kc(u,x)&&(r.flags|=32),Qp(n,r),Tn(n,r,w,a),r.child;case 6:return n===null&&ru(r),null;case 13:return nm(n,r,a);case 4:return hu(r,r.stateNode.containerInfo),u=r.pendingProps,n===null?r.child=Fs(r,null,u,a):Tn(n,r,u,a),r.child;case 11:return u=r.type,p=r.pendingProps,p=r.elementType===u?p:pi(u,p),Yp(n,r,u,p,a);case 7:return Tn(n,r,r.pendingProps,a),r.child;case 8:return Tn(n,r,r.pendingProps.children,a),r.child;case 12:return Tn(n,r,r.pendingProps.children,a),r.child;case 10:e:{if(u=r.type._context,p=r.pendingProps,x=r.memoizedProps,w=p.value,Ut(il,u._currentValue),u._currentValue=w,x!==null)if(hi(x.value,w)){if(x.children===p.children&&!On.current){r=$i(n,r,a);break e}}else for(x=r.child,x!==null&&(x.return=r);x!==null;){var N=x.dependencies;if(N!==null){w=x.child;for(var H=N.firstContext;H!==null;){if(H.context===u){if(x.tag===1){H=Ki(-1,a&-a),H.tag=2;var te=x.updateQueue;if(te!==null){te=te.shared;var ye=te.pending;ye===null?H.next=H:(H.next=ye.next,ye.next=H),te.pending=H}}x.lanes|=a,H=x.alternate,H!==null&&(H.lanes|=a),cu(x.return,a,r),N.lanes|=a;break}H=H.next}}else if(x.tag===10)w=x.type===r.type?null:x.child;else if(x.tag===18){if(w=x.return,w===null)throw Error(t(341));w.lanes|=a,N=w.alternate,N!==null&&(N.lanes|=a),cu(w,a,r),w=x.sibling}else w=x.child;if(w!==null)w.return=x;else for(w=x;w!==null;){if(w===r){w=null;break}if(x=w.sibling,x!==null){x.return=w.return,w=x;break}w=w.return}x=w}Tn(n,r,p.children,a),r=r.child}return r;case 9:return p=r.type,u=r.pendingProps.children,ks(r,a),p=ni(p),u=u(p),r.flags|=1,Tn(n,r,u,a),r.child;case 14:return u=r.type,p=pi(u,r.pendingProps),p=pi(u.type,p),Kp(n,r,u,p,a);case 15:return $p(n,r,r.type,r.pendingProps,a);case 17:return u=r.type,p=r.pendingProps,p=r.elementType===u?p:pi(u,p),ml(n,r),r.tag=1,kn(u)?(n=!0,Za(r)):n=!1,ks(r,a),Hp(r,u,p),Tu(r,u,p,a),Pu(null,r,u,!0,n,a);case 19:return rm(n,r,a);case 22:return Zp(n,r,a)}throw Error(t(156,r.tag))};function Rm(n,r){return ne(n,r)}function X_(n,r,a,u){this.tag=n,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=r,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=u,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function si(n,r,a,u){return new X_(n,r,a,u)}function Ku(n){return n=n.prototype,!(!n||!n.isReactComponent)}function j_(n){if(typeof n=="function")return Ku(n)?1:0;if(n!=null){if(n=n.$$typeof,n===Q)return 11;if(n===le)return 14}return 2}function br(n,r){var a=n.alternate;return a===null?(a=si(n.tag,r,n.key,n.mode),a.elementType=n.elementType,a.type=n.type,a.stateNode=n.stateNode,a.alternate=n,n.alternate=a):(a.pendingProps=r,a.type=n.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=n.flags&14680064,a.childLanes=n.childLanes,a.lanes=n.lanes,a.child=n.child,a.memoizedProps=n.memoizedProps,a.memoizedState=n.memoizedState,a.updateQueue=n.updateQueue,r=n.dependencies,a.dependencies=r===null?null:{lanes:r.lanes,firstContext:r.firstContext},a.sibling=n.sibling,a.index=n.index,a.ref=n.ref,a}function Al(n,r,a,u,p,x){var w=2;if(u=n,typeof n=="function")Ku(n)&&(w=1);else if(typeof n=="string")w=5;else e:switch(n){case O:return rs(a.children,p,x,r);case z:w=8,p|=8;break;case P:return n=si(12,a,r,p|2),n.elementType=P,n.lanes=x,n;case Y:return n=si(13,a,r,p),n.elementType=Y,n.lanes=x,n;case ie:return n=si(19,a,r,p),n.elementType=ie,n.lanes=x,n;case ce:return Cl(a,p,x,r);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case A:w=10;break e;case U:w=9;break e;case Q:w=11;break e;case le:w=14;break e;case se:w=16,u=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return r=si(w,a,r,p),r.elementType=n,r.type=u,r.lanes=x,r}function rs(n,r,a,u){return n=si(7,n,u,r),n.lanes=a,n}function Cl(n,r,a,u){return n=si(22,n,u,r),n.elementType=ce,n.lanes=a,n.stateNode={isHidden:!1},n}function $u(n,r,a){return n=si(6,n,null,r),n.lanes=a,n}function Zu(n,r,a){return r=si(4,n.children!==null?n.children:[],n.key,r),r.lanes=a,r.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},r}function q_(n,r,a,u,p){this.tag=r,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Jn(0),this.expirationTimes=Jn(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Jn(0),this.identifierPrefix=u,this.onRecoverableError=p,this.mutableSourceEagerHydrationData=null}function Qu(n,r,a,u,p,x,w,N,H){return n=new q_(n,r,a,N,H),r===1?(r=1,x===!0&&(r|=8)):r=0,x=si(3,null,null,r),n.current=x,x.stateNode=n,x.memoizedState={element:u,isDehydrated:a,cache:null,transitions:null,pendingSuspenseBoundaries:null},fu(x),n}function Y_(n,r,a){var u=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:I,key:u==null?null:""+u,children:n,containerInfo:r,implementation:a}}function Pm(n){if(!n)return Sr;n=n._reactInternals;e:{if(Ri(n)!==n||n.tag!==1)throw Error(t(170));var r=n;do{switch(r.tag){case 3:r=r.stateNode.context;break e;case 1:if(kn(r.type)){r=r.stateNode.__reactInternalMemoizedMergedChildContext;break e}}r=r.return}while(r!==null);throw Error(t(171))}if(n.tag===1){var a=n.type;if(kn(a))return ip(n,a,r)}return r}function bm(n,r,a,u,p,x,w,N,H){return n=Qu(a,u,!0,n,p,x,w,N,H),n.context=Pm(null),a=n.current,u=An(),p=Rr(a),x=Ki(u,p),x.callback=r??null,wr(a,x,p),n.current.lanes=p,Fn(n,p,u),Hn(n,u),n}function Rl(n,r,a,u){var p=r.current,x=An(),w=Rr(p);return a=Pm(a),r.context===null?r.context=a:r.pendingContext=a,r=Ki(x,w),r.payload={element:n},u=u===void 0?null:u,u!==null&&(r.callback=u),n=wr(p,r,w),n!==null&&(vi(n,p,w,x),sl(n,p,w)),w}function Pl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Lm(n,r){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var a=n.retryLane;n.retryLane=a!==0&&a<r?a:r}}function Ju(n,r){Lm(n,r),(n=n.alternate)&&Lm(n,r)}function K_(){return null}var Dm=typeof reportError=="function"?reportError:function(n){console.error(n)};function ef(n){this._internalRoot=n}bl.prototype.render=ef.prototype.render=function(n){var r=this._internalRoot;if(r===null)throw Error(t(409));Rl(n,r,null,null)},bl.prototype.unmount=ef.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var r=n.containerInfo;ts(function(){Rl(null,n,null,null)}),r[Wi]=null}};function bl(n){this._internalRoot=n}bl.prototype.unstable_scheduleHydration=function(n){if(n){var r=md();n={blockedOn:null,target:n,priority:r};for(var a=0;a<gr.length&&r!==0&&r<gr[a].priority;a++);gr.splice(a,0,n),a===0&&_d(n)}};function tf(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Ll(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Nm(){}function $_(n,r,a,u,p){if(p){if(typeof u=="function"){var x=u;u=function(){var te=Pl(w);x.call(te)}}var w=bm(r,u,n,0,null,!1,!1,"",Nm);return n._reactRootContainer=w,n[Wi]=w.current,Bo(n.nodeType===8?n.parentNode:n),ts(),w}for(;p=n.lastChild;)n.removeChild(p);if(typeof u=="function"){var N=u;u=function(){var te=Pl(H);N.call(te)}}var H=Qu(n,0,!1,null,null,!1,!1,"",Nm);return n._reactRootContainer=H,n[Wi]=H.current,Bo(n.nodeType===8?n.parentNode:n),ts(function(){Rl(r,H,a,u)}),H}function Dl(n,r,a,u,p){var x=a._reactRootContainer;if(x){var w=x;if(typeof p=="function"){var N=p;p=function(){var H=Pl(w);N.call(H)}}Rl(r,w,n,p)}else w=$_(a,r,n,p,u);return Pl(w)}dd=function(n){switch(n.tag){case 3:var r=n.stateNode;if(r.current.memoizedState.isDehydrated){var a=Zt(r.pendingLanes);a!==0&&(Tc(r,a|1),Hn(r,Te()),(wt&6)===0&&(Gs=Te()+500,Mr()))}break;case 13:ts(function(){var u=Yi(n,1);if(u!==null){var p=An();vi(u,n,1,p)}}),Ju(n,1)}},Ac=function(n){if(n.tag===13){var r=Yi(n,134217728);if(r!==null){var a=An();vi(r,n,134217728,a)}Ju(n,134217728)}},pd=function(n){if(n.tag===13){var r=Rr(n),a=Yi(n,r);if(a!==null){var u=An();vi(a,n,r,u)}Ju(n,r)}},md=function(){return Lt},gd=function(n,r){var a=Lt;try{return Lt=n,r()}finally{Lt=a}},Ne=function(n,r,a){switch(r){case"input":if(Ve(n,a),r=a.name,a.type==="radio"&&r!=null){for(a=n;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll("input[name="+JSON.stringify(""+r)+'][type="radio"]'),r=0;r<a.length;r++){var u=a[r];if(u!==n&&u.form===n.form){var p=Ka(u);if(!p)throw Error(t(90));ve(u),Ve(u,p)}}}break;case"textarea":pe(n,a);break;case"select":r=a.value,r!=null&&D(n,!!a.multiple,r,!1)}},Ft=ju,$t=ts;var Z_={usingClientEntryPoint:!1,Events:[Go,bs,Ka,Ue,ht,ju]},ia={findFiberByHostInstance:qr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Q_={bundleType:ia.bundleType,version:ia.version,rendererPackageName:ia.rendererPackageName,rendererConfig:ia.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:T.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=b(n),n===null?null:n.stateNode},findFiberByHostInstance:ia.findFiberByHostInstance||K_,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Nl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Nl.isDisabled&&Nl.supportsFiber)try{Pt=Nl.inject(Q_),yt=Nl}catch{}}return Vn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Z_,Vn.createPortal=function(n,r){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!tf(r))throw Error(t(200));return Y_(n,r,null,a)},Vn.createRoot=function(n,r){if(!tf(n))throw Error(t(299));var a=!1,u="",p=Dm;return r!=null&&(r.unstable_strictMode===!0&&(a=!0),r.identifierPrefix!==void 0&&(u=r.identifierPrefix),r.onRecoverableError!==void 0&&(p=r.onRecoverableError)),r=Qu(n,1,!1,null,null,a,!1,u,p),n[Wi]=r.current,Bo(n.nodeType===8?n.parentNode:n),new ef(r)},Vn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var r=n._reactInternals;if(r===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=b(r),n=n===null?null:n.stateNode,n},Vn.flushSync=function(n){return ts(n)},Vn.hydrate=function(n,r,a){if(!Ll(r))throw Error(t(200));return Dl(null,n,r,!0,a)},Vn.hydrateRoot=function(n,r,a){if(!tf(n))throw Error(t(405));var u=a!=null&&a.hydratedSources||null,p=!1,x="",w=Dm;if(a!=null&&(a.unstable_strictMode===!0&&(p=!0),a.identifierPrefix!==void 0&&(x=a.identifierPrefix),a.onRecoverableError!==void 0&&(w=a.onRecoverableError)),r=bm(r,null,n,1,a??null,p,!1,x,w),n[Wi]=r.current,Bo(n),u)for(n=0;n<u.length;n++)a=u[n],p=a._getVersion,p=p(a._source),r.mutableSourceEagerHydrationData==null?r.mutableSourceEagerHydrationData=[a,p]:r.mutableSourceEagerHydrationData.push(a,p);return new bl(r)},Vn.render=function(n,r,a){if(!Ll(r))throw Error(t(200));return Dl(null,n,r,!1,a)},Vn.unmountComponentAtNode=function(n){if(!Ll(n))throw Error(t(40));return n._reactRootContainer?(ts(function(){Dl(null,null,n,!1,function(){n._reactRootContainer=null,n[Wi]=null})}),!0):!1},Vn.unstable_batchedUpdates=ju,Vn.unstable_renderSubtreeIntoContainer=function(n,r,a,u){if(!Ll(a))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Dl(n,r,a,!1,u)},Vn.version="18.3.1-next-f1338f8080-20240426",Vn}var Hm;function lx(){if(Hm)return sf.exports;Hm=1;function i(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i)}catch(e){console.error(e)}}return i(),sf.exports=ax(),sf.exports}var Vm;function cx(){if(Vm)return Il;Vm=1;var i=lx();return Il.createRoot=i.createRoot,Il.hydrateRoot=i.hydrateRoot,Il}var ux=cx();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const jh="170",fx=0,Gm=1,hx=2,v0=1,_0=2,rr=3,Gr=0,Dn=1,ci=2,Hr=0,fo=1,Kf=2,Wm=3,Xm=4,dx=5,ds=100,px=101,mx=102,gx=103,vx=104,_x=200,xx=201,yx=202,Sx=203,$f=204,Zf=205,Mx=206,Ex=207,wx=208,Tx=209,Ax=210,Cx=211,Rx=212,Px=213,bx=214,Qf=0,Jf=1,eh=2,go=3,th=4,nh=5,ih=6,rh=7,x0=0,Lx=1,Dx=2,Vr=0,Nx=1,Ix=2,Ux=3,Fx=4,Ox=5,kx=6,zx=7,y0=300,vo=301,_o=302,sh=303,oh=304,vc=306,xa=1e3,ms=1001,ah=1002,wi=1003,Bx=1004,Ul=1005,Oi=1006,lf=1007,gs=1008,ur=1009,S0=1010,M0=1011,ya=1012,qh=1013,vs=1014,or=1015,Ta=1016,Yh=1017,Kh=1018,xo=1020,E0=35902,w0=1021,T0=1022,Mi=1023,A0=1024,C0=1025,ho=1026,yo=1027,R0=1028,$h=1029,P0=1030,Zh=1031,Qh=1033,cc=33776,uc=33777,fc=33778,hc=33779,lh=35840,ch=35841,uh=35842,fh=35843,hh=36196,dh=37492,ph=37496,mh=37808,gh=37809,vh=37810,_h=37811,xh=37812,yh=37813,Sh=37814,Mh=37815,Eh=37816,wh=37817,Th=37818,Ah=37819,Ch=37820,Rh=37821,dc=36492,Ph=36494,bh=36495,b0=36283,Lh=36284,Dh=36285,Nh=36286,Hx=3200,Vx=3201,L0=0,Gx=1,zr="",fn="srgb",Eo="srgb-linear",_c="linear",Dt="srgb",Xs=7680,jm=519,Wx=512,Xx=513,jx=514,D0=515,qx=516,Yx=517,Kx=518,$x=519,qm=35044,Ym="300 es",ar=2e3,mc=2001;class wo{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[e]===void 0&&(s[e]=[]),s[e].indexOf(t)===-1&&s[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const s=this._listeners;return s[e]!==void 0&&s[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const o=this._listeners[e];if(o!==void 0){const l=o.indexOf(t);l!==-1&&o.splice(l,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const s=this._listeners[e.type];if(s!==void 0){e.target=this;const o=s.slice(0);for(let l=0,c=o.length;l<c;l++)o[l].call(this,e);e.target=null}}}const yn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Km=1234567;const ha=Math.PI/180,Sa=180/Math.PI;function ys(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(yn[i&255]+yn[i>>8&255]+yn[i>>16&255]+yn[i>>24&255]+"-"+yn[e&255]+yn[e>>8&255]+"-"+yn[e>>16&15|64]+yn[e>>24&255]+"-"+yn[t&63|128]+yn[t>>8&255]+"-"+yn[t>>16&255]+yn[t>>24&255]+yn[s&255]+yn[s>>8&255]+yn[s>>16&255]+yn[s>>24&255]).toLowerCase()}function hn(i,e,t){return Math.max(e,Math.min(t,i))}function Jh(i,e){return(i%e+e)%e}function Zx(i,e,t,s,o){return s+(i-e)*(o-s)/(t-e)}function Qx(i,e,t){return i!==e?(t-i)/(e-i):0}function da(i,e,t){return(1-t)*i+t*e}function Jx(i,e,t,s){return da(i,e,1-Math.exp(-t*s))}function ey(i,e=1){return e-Math.abs(Jh(i,e*2)-e)}function ty(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function ny(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function iy(i,e){return i+Math.floor(Math.random()*(e-i+1))}function ry(i,e){return i+Math.random()*(e-i)}function sy(i){return i*(.5-Math.random())}function oy(i){i!==void 0&&(Km=i);let e=Km+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function ay(i){return i*ha}function ly(i){return i*Sa}function cy(i){return(i&i-1)===0&&i!==0}function uy(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function fy(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function hy(i,e,t,s,o){const l=Math.cos,c=Math.sin,f=l(t/2),h=c(t/2),d=l((e+s)/2),m=c((e+s)/2),_=l((e-s)/2),g=c((e-s)/2),y=l((s-e)/2),M=c((s-e)/2);switch(o){case"XYX":i.set(f*m,h*_,h*g,f*d);break;case"YZY":i.set(h*g,f*m,h*_,f*d);break;case"ZXZ":i.set(h*_,h*g,f*m,f*d);break;case"XZX":i.set(f*m,h*M,h*y,f*d);break;case"YXY":i.set(h*y,f*m,h*M,f*d);break;case"ZYZ":i.set(h*M,h*y,f*m,f*d);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+o)}}function ao(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Cn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const lr={DEG2RAD:ha,RAD2DEG:Sa,generateUUID:ys,clamp:hn,euclideanModulo:Jh,mapLinear:Zx,inverseLerp:Qx,lerp:da,damp:Jx,pingpong:ey,smoothstep:ty,smootherstep:ny,randInt:iy,randFloat:ry,randFloatSpread:sy,seededRandom:oy,degToRad:ay,radToDeg:ly,isPowerOfTwo:cy,ceilPowerOfTwo:uy,floorPowerOfTwo:fy,setQuaternionFromProperEuler:hy,normalize:Cn,denormalize:ao};class ze{constructor(e=0,t=0){ze.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,s=this.y,o=e.elements;return this.x=o[0]*t+o[3]*s+o[6],this.y=o[1]*t+o[4]*s+o[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(e,Math.min(t,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const s=this.dot(e)/t;return Math.acos(hn(s,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,s=this.y-e.y;return t*t+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,s){return this.x=e.x+(t.x-e.x)*s,this.y=e.y+(t.y-e.y)*s,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const s=Math.cos(t),o=Math.sin(t),l=this.x-e.x,c=this.y-e.y;return this.x=l*s-c*o+e.x,this.y=l*o+c*s+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class mt{constructor(e,t,s,o,l,c,f,h,d){mt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,s,o,l,c,f,h,d)}set(e,t,s,o,l,c,f,h,d){const m=this.elements;return m[0]=e,m[1]=o,m[2]=f,m[3]=t,m[4]=l,m[5]=h,m[6]=s,m[7]=c,m[8]=d,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,s=e.elements;return t[0]=s[0],t[1]=s[1],t[2]=s[2],t[3]=s[3],t[4]=s[4],t[5]=s[5],t[6]=s[6],t[7]=s[7],t[8]=s[8],this}extractBasis(e,t,s){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const s=e.elements,o=t.elements,l=this.elements,c=s[0],f=s[3],h=s[6],d=s[1],m=s[4],_=s[7],g=s[2],y=s[5],M=s[8],E=o[0],S=o[3],v=o[6],L=o[1],R=o[4],T=o[7],B=o[2],I=o[5],O=o[8];return l[0]=c*E+f*L+h*B,l[3]=c*S+f*R+h*I,l[6]=c*v+f*T+h*O,l[1]=d*E+m*L+_*B,l[4]=d*S+m*R+_*I,l[7]=d*v+m*T+_*O,l[2]=g*E+y*L+M*B,l[5]=g*S+y*R+M*I,l[8]=g*v+y*T+M*O,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],s=e[1],o=e[2],l=e[3],c=e[4],f=e[5],h=e[6],d=e[7],m=e[8];return t*c*m-t*f*d-s*l*m+s*f*h+o*l*d-o*c*h}invert(){const e=this.elements,t=e[0],s=e[1],o=e[2],l=e[3],c=e[4],f=e[5],h=e[6],d=e[7],m=e[8],_=m*c-f*d,g=f*h-m*l,y=d*l-c*h,M=t*_+s*g+o*y;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const E=1/M;return e[0]=_*E,e[1]=(o*d-m*s)*E,e[2]=(f*s-o*c)*E,e[3]=g*E,e[4]=(m*t-o*h)*E,e[5]=(o*l-f*t)*E,e[6]=y*E,e[7]=(s*h-d*t)*E,e[8]=(c*t-s*l)*E,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,s,o,l,c,f){const h=Math.cos(l),d=Math.sin(l);return this.set(s*h,s*d,-s*(h*c+d*f)+c+e,-o*d,o*h,-o*(-d*c+h*f)+f+t,0,0,1),this}scale(e,t){return this.premultiply(cf.makeScale(e,t)),this}rotate(e){return this.premultiply(cf.makeRotation(-e)),this}translate(e,t){return this.premultiply(cf.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),s=Math.sin(e);return this.set(t,-s,0,s,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,s=e.elements;for(let o=0;o<9;o++)if(t[o]!==s[o])return!1;return!0}fromArray(e,t=0){for(let s=0;s<9;s++)this.elements[s]=e[s+t];return this}toArray(e=[],t=0){const s=this.elements;return e[t]=s[0],e[t+1]=s[1],e[t+2]=s[2],e[t+3]=s[3],e[t+4]=s[4],e[t+5]=s[5],e[t+6]=s[6],e[t+7]=s[7],e[t+8]=s[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const cf=new mt;function N0(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function gc(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function dy(){const i=gc("canvas");return i.style.display="block",i}const $m={};function ua(i){i in $m||($m[i]=!0,console.warn(i))}function py(i,e,t){return new Promise(function(s,o){function l(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:o();break;case i.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:s()}}setTimeout(l,t)})}function my(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function gy(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const At={enabled:!0,workingColorSpace:Eo,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Dt&&(i.r=cr(i.r),i.g=cr(i.g),i.b=cr(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Dt&&(i.r=po(i.r),i.g=po(i.g),i.b=po(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===zr?_c:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function cr(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function po(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Zm=[.64,.33,.3,.6,.15,.06],Qm=[.2126,.7152,.0722],Jm=[.3127,.329],eg=new mt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),tg=new mt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);At.define({[Eo]:{primaries:Zm,whitePoint:Jm,transfer:_c,toXYZ:eg,fromXYZ:tg,luminanceCoefficients:Qm,workingColorSpaceConfig:{unpackColorSpace:fn},outputColorSpaceConfig:{drawingBufferColorSpace:fn}},[fn]:{primaries:Zm,whitePoint:Jm,transfer:Dt,toXYZ:eg,fromXYZ:tg,luminanceCoefficients:Qm,outputColorSpaceConfig:{drawingBufferColorSpace:fn}}});let js;class vy{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{js===void 0&&(js=gc("canvas")),js.width=e.width,js.height=e.height;const s=js.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),t=js}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=gc("canvas");t.width=e.width,t.height=e.height;const s=t.getContext("2d");s.drawImage(e,0,0,e.width,e.height);const o=s.getImageData(0,0,e.width,e.height),l=o.data;for(let c=0;c<l.length;c++)l[c]=cr(l[c]/255)*255;return s.putImageData(o,0,0),t}else if(e.data){const t=e.data.slice(0);for(let s=0;s<t.length;s++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[s]=Math.floor(cr(t[s]/255)*255):t[s]=cr(t[s]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let _y=0;class I0{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_y++}),this.uuid=ys(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const s={uuid:this.uuid,url:""},o=this.data;if(o!==null){let l;if(Array.isArray(o)){l=[];for(let c=0,f=o.length;c<f;c++)o[c].isDataTexture?l.push(uf(o[c].image)):l.push(uf(o[c]))}else l=uf(o);s.url=l}return t||(e.images[this.uuid]=s),s}}function uf(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?vy.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let xy=0;class Nn extends wo{constructor(e=Nn.DEFAULT_IMAGE,t=Nn.DEFAULT_MAPPING,s=ms,o=ms,l=Oi,c=gs,f=Mi,h=ur,d=Nn.DEFAULT_ANISOTROPY,m=zr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xy++}),this.uuid=ys(),this.name="",this.source=new I0(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=s,this.wrapT=o,this.magFilter=l,this.minFilter=c,this.anisotropy=d,this.format=f,this.internalFormat=null,this.type=h,this.offset=new ze(0,0),this.repeat=new ze(1,1),this.center=new ze(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new mt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const s={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),t||(e.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==y0)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case xa:e.x=e.x-Math.floor(e.x);break;case ms:e.x=e.x<0?0:1;break;case ah:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case xa:e.y=e.y-Math.floor(e.y);break;case ms:e.y=e.y<0?0:1;break;case ah:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Nn.DEFAULT_IMAGE=null;Nn.DEFAULT_MAPPING=y0;Nn.DEFAULT_ANISOTROPY=1;class Xt{constructor(e=0,t=0,s=0,o=1){Xt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=s,this.w=o}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,s,o){return this.x=e,this.y=t,this.z=s,this.w=o,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,s=this.y,o=this.z,l=this.w,c=e.elements;return this.x=c[0]*t+c[4]*s+c[8]*o+c[12]*l,this.y=c[1]*t+c[5]*s+c[9]*o+c[13]*l,this.z=c[2]*t+c[6]*s+c[10]*o+c[14]*l,this.w=c[3]*t+c[7]*s+c[11]*o+c[15]*l,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,s,o,l;const h=e.elements,d=h[0],m=h[4],_=h[8],g=h[1],y=h[5],M=h[9],E=h[2],S=h[6],v=h[10];if(Math.abs(m-g)<.01&&Math.abs(_-E)<.01&&Math.abs(M-S)<.01){if(Math.abs(m+g)<.1&&Math.abs(_+E)<.1&&Math.abs(M+S)<.1&&Math.abs(d+y+v-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const R=(d+1)/2,T=(y+1)/2,B=(v+1)/2,I=(m+g)/4,O=(_+E)/4,z=(M+S)/4;return R>T&&R>B?R<.01?(s=0,o=.707106781,l=.707106781):(s=Math.sqrt(R),o=I/s,l=O/s):T>B?T<.01?(s=.707106781,o=0,l=.707106781):(o=Math.sqrt(T),s=I/o,l=z/o):B<.01?(s=.707106781,o=.707106781,l=0):(l=Math.sqrt(B),s=O/l,o=z/l),this.set(s,o,l,t),this}let L=Math.sqrt((S-M)*(S-M)+(_-E)*(_-E)+(g-m)*(g-m));return Math.abs(L)<.001&&(L=1),this.x=(S-M)/L,this.y=(_-E)/L,this.z=(g-m)/L,this.w=Math.acos((d+y+v-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(e,Math.min(t,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,s){return this.x=e.x+(t.x-e.x)*s,this.y=e.y+(t.y-e.y)*s,this.z=e.z+(t.z-e.z)*s,this.w=e.w+(t.w-e.w)*s,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class yy extends wo{constructor(e=1,t=1,s={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Xt(0,0,e,t),this.scissorTest=!1,this.viewport=new Xt(0,0,e,t);const o={width:e,height:t,depth:1};s=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Oi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},s);const l=new Nn(o,s.mapping,s.wrapS,s.wrapT,s.magFilter,s.minFilter,s.format,s.type,s.anisotropy,s.colorSpace);l.flipY=!1,l.generateMipmaps=s.generateMipmaps,l.internalFormat=s.internalFormat,this.textures=[];const c=s.count;for(let f=0;f<c;f++)this.textures[f]=l.clone(),this.textures[f].isRenderTargetTexture=!0;this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.resolveDepthBuffer=s.resolveDepthBuffer,this.resolveStencilBuffer=s.resolveStencilBuffer,this.depthTexture=s.depthTexture,this.samples=s.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,s=1){if(this.width!==e||this.height!==t||this.depth!==s){this.width=e,this.height=t,this.depth=s;for(let o=0,l=this.textures.length;o<l;o++)this.textures[o].image.width=e,this.textures[o].image.height=t,this.textures[o].image.depth=s;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let s=0,o=e.textures.length;s<o;s++)this.textures[s]=e.textures[s].clone(),this.textures[s].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new I0(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class _s extends yy{constructor(e=1,t=1,s={}){super(e,t,s),this.isWebGLRenderTarget=!0}}class U0 extends Nn{constructor(e=null,t=1,s=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:s,depth:o},this.magFilter=wi,this.minFilter=wi,this.wrapR=ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Sy extends Nn{constructor(e=null,t=1,s=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:s,depth:o},this.magFilter=wi,this.minFilter=wi,this.wrapR=ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ai{constructor(e=0,t=0,s=0,o=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=s,this._w=o}static slerpFlat(e,t,s,o,l,c,f){let h=s[o+0],d=s[o+1],m=s[o+2],_=s[o+3];const g=l[c+0],y=l[c+1],M=l[c+2],E=l[c+3];if(f===0){e[t+0]=h,e[t+1]=d,e[t+2]=m,e[t+3]=_;return}if(f===1){e[t+0]=g,e[t+1]=y,e[t+2]=M,e[t+3]=E;return}if(_!==E||h!==g||d!==y||m!==M){let S=1-f;const v=h*g+d*y+m*M+_*E,L=v>=0?1:-1,R=1-v*v;if(R>Number.EPSILON){const B=Math.sqrt(R),I=Math.atan2(B,v*L);S=Math.sin(S*I)/B,f=Math.sin(f*I)/B}const T=f*L;if(h=h*S+g*T,d=d*S+y*T,m=m*S+M*T,_=_*S+E*T,S===1-f){const B=1/Math.sqrt(h*h+d*d+m*m+_*_);h*=B,d*=B,m*=B,_*=B}}e[t]=h,e[t+1]=d,e[t+2]=m,e[t+3]=_}static multiplyQuaternionsFlat(e,t,s,o,l,c){const f=s[o],h=s[o+1],d=s[o+2],m=s[o+3],_=l[c],g=l[c+1],y=l[c+2],M=l[c+3];return e[t]=f*M+m*_+h*y-d*g,e[t+1]=h*M+m*g+d*_-f*y,e[t+2]=d*M+m*y+f*g-h*_,e[t+3]=m*M-f*_-h*g-d*y,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,s,o){return this._x=e,this._y=t,this._z=s,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const s=e._x,o=e._y,l=e._z,c=e._order,f=Math.cos,h=Math.sin,d=f(s/2),m=f(o/2),_=f(l/2),g=h(s/2),y=h(o/2),M=h(l/2);switch(c){case"XYZ":this._x=g*m*_+d*y*M,this._y=d*y*_-g*m*M,this._z=d*m*M+g*y*_,this._w=d*m*_-g*y*M;break;case"YXZ":this._x=g*m*_+d*y*M,this._y=d*y*_-g*m*M,this._z=d*m*M-g*y*_,this._w=d*m*_+g*y*M;break;case"ZXY":this._x=g*m*_-d*y*M,this._y=d*y*_+g*m*M,this._z=d*m*M+g*y*_,this._w=d*m*_-g*y*M;break;case"ZYX":this._x=g*m*_-d*y*M,this._y=d*y*_+g*m*M,this._z=d*m*M-g*y*_,this._w=d*m*_+g*y*M;break;case"YZX":this._x=g*m*_+d*y*M,this._y=d*y*_+g*m*M,this._z=d*m*M-g*y*_,this._w=d*m*_-g*y*M;break;case"XZY":this._x=g*m*_-d*y*M,this._y=d*y*_-g*m*M,this._z=d*m*M+g*y*_,this._w=d*m*_+g*y*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const s=t/2,o=Math.sin(s);return this._x=e.x*o,this._y=e.y*o,this._z=e.z*o,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,s=t[0],o=t[4],l=t[8],c=t[1],f=t[5],h=t[9],d=t[2],m=t[6],_=t[10],g=s+f+_;if(g>0){const y=.5/Math.sqrt(g+1);this._w=.25/y,this._x=(m-h)*y,this._y=(l-d)*y,this._z=(c-o)*y}else if(s>f&&s>_){const y=2*Math.sqrt(1+s-f-_);this._w=(m-h)/y,this._x=.25*y,this._y=(o+c)/y,this._z=(l+d)/y}else if(f>_){const y=2*Math.sqrt(1+f-s-_);this._w=(l-d)/y,this._x=(o+c)/y,this._y=.25*y,this._z=(h+m)/y}else{const y=2*Math.sqrt(1+_-s-f);this._w=(c-o)/y,this._x=(l+d)/y,this._y=(h+m)/y,this._z=.25*y}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let s=e.dot(t)+1;return s<Number.EPSILON?(s=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=s):(this._x=0,this._y=-e.z,this._z=e.y,this._w=s)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=s),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(hn(this.dot(e),-1,1)))}rotateTowards(e,t){const s=this.angleTo(e);if(s===0)return this;const o=Math.min(1,t/s);return this.slerp(e,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const s=e._x,o=e._y,l=e._z,c=e._w,f=t._x,h=t._y,d=t._z,m=t._w;return this._x=s*m+c*f+o*d-l*h,this._y=o*m+c*h+l*f-s*d,this._z=l*m+c*d+s*h-o*f,this._w=c*m-s*f-o*h-l*d,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const s=this._x,o=this._y,l=this._z,c=this._w;let f=c*e._w+s*e._x+o*e._y+l*e._z;if(f<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,f=-f):this.copy(e),f>=1)return this._w=c,this._x=s,this._y=o,this._z=l,this;const h=1-f*f;if(h<=Number.EPSILON){const y=1-t;return this._w=y*c+t*this._w,this._x=y*s+t*this._x,this._y=y*o+t*this._y,this._z=y*l+t*this._z,this.normalize(),this}const d=Math.sqrt(h),m=Math.atan2(d,f),_=Math.sin((1-t)*m)/d,g=Math.sin(t*m)/d;return this._w=c*_+this._w*g,this._x=s*_+this._x*g,this._y=o*_+this._y*g,this._z=l*_+this._z*g,this._onChangeCallback(),this}slerpQuaternions(e,t,s){return this.copy(e).slerp(t,s)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),s=Math.random(),o=Math.sqrt(1-s),l=Math.sqrt(s);return this.set(o*Math.sin(e),o*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class G{constructor(e=0,t=0,s=0){G.prototype.isVector3=!0,this.x=e,this.y=t,this.z=s}set(e,t,s){return s===void 0&&(s=this.z),this.x=e,this.y=t,this.z=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ng.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ng.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,s=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[3]*s+l[6]*o,this.y=l[1]*t+l[4]*s+l[7]*o,this.z=l[2]*t+l[5]*s+l[8]*o,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,s=this.y,o=this.z,l=e.elements,c=1/(l[3]*t+l[7]*s+l[11]*o+l[15]);return this.x=(l[0]*t+l[4]*s+l[8]*o+l[12])*c,this.y=(l[1]*t+l[5]*s+l[9]*o+l[13])*c,this.z=(l[2]*t+l[6]*s+l[10]*o+l[14])*c,this}applyQuaternion(e){const t=this.x,s=this.y,o=this.z,l=e.x,c=e.y,f=e.z,h=e.w,d=2*(c*o-f*s),m=2*(f*t-l*o),_=2*(l*s-c*t);return this.x=t+h*d+c*_-f*m,this.y=s+h*m+f*d-l*_,this.z=o+h*_+l*m-c*d,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,s=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[4]*s+l[8]*o,this.y=l[1]*t+l[5]*s+l[9]*o,this.z=l[2]*t+l[6]*s+l[10]*o,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(e,Math.min(t,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,s){return this.x=e.x+(t.x-e.x)*s,this.y=e.y+(t.y-e.y)*s,this.z=e.z+(t.z-e.z)*s,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const s=e.x,o=e.y,l=e.z,c=t.x,f=t.y,h=t.z;return this.x=o*h-l*f,this.y=l*c-s*h,this.z=s*f-o*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const s=e.dot(this)/t;return this.copy(e).multiplyScalar(s)}projectOnPlane(e){return ff.copy(this).projectOnVector(e),this.sub(ff)}reflect(e){return this.sub(ff.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const s=this.dot(e)/t;return Math.acos(hn(s,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,s=this.y-e.y,o=this.z-e.z;return t*t+s*s+o*o}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,s){const o=Math.sin(t)*e;return this.x=o*Math.sin(s),this.y=Math.cos(t)*e,this.z=o*Math.cos(s),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,s){return this.x=e*Math.sin(t),this.y=s,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),s=this.setFromMatrixColumn(e,1).length(),o=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=s,this.z=o,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,s=Math.sqrt(1-t*t);return this.x=s*Math.cos(e),this.y=t,this.z=s*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ff=new G,ng=new Ai;class Aa{constructor(e=new G(1/0,1/0,1/0),t=new G(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,s=e.length;t<s;t+=3)this.expandByPoint(_i.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,s=e.count;t<s;t++)this.expandByPoint(_i.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,s=e.length;t<s;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const s=_i.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(s),this.max.copy(e).add(s),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const s=e.geometry;if(s!==void 0){const l=s.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let c=0,f=l.count;c<f;c++)e.isMesh===!0?e.getVertexPosition(c,_i):_i.fromBufferAttribute(l,c),_i.applyMatrix4(e.matrixWorld),this.expandByPoint(_i);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Fl.copy(e.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),Fl.copy(s.boundingBox)),Fl.applyMatrix4(e.matrixWorld),this.union(Fl)}const o=e.children;for(let l=0,c=o.length;l<c;l++)this.expandByObject(o[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,_i),_i.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,s;return e.normal.x>0?(t=e.normal.x*this.min.x,s=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,s=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,s+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,s+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,s+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,s+=e.normal.z*this.min.z),t<=-e.constant&&s>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(sa),Ol.subVectors(this.max,sa),qs.subVectors(e.a,sa),Ys.subVectors(e.b,sa),Ks.subVectors(e.c,sa),Dr.subVectors(Ys,qs),Nr.subVectors(Ks,Ys),ss.subVectors(qs,Ks);let t=[0,-Dr.z,Dr.y,0,-Nr.z,Nr.y,0,-ss.z,ss.y,Dr.z,0,-Dr.x,Nr.z,0,-Nr.x,ss.z,0,-ss.x,-Dr.y,Dr.x,0,-Nr.y,Nr.x,0,-ss.y,ss.x,0];return!hf(t,qs,Ys,Ks,Ol)||(t=[1,0,0,0,1,0,0,0,1],!hf(t,qs,Ys,Ks,Ol))?!1:(kl.crossVectors(Dr,Nr),t=[kl.x,kl.y,kl.z],hf(t,qs,Ys,Ks,Ol))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,_i).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(_i).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qi=[new G,new G,new G,new G,new G,new G,new G,new G],_i=new G,Fl=new Aa,qs=new G,Ys=new G,Ks=new G,Dr=new G,Nr=new G,ss=new G,sa=new G,Ol=new G,kl=new G,os=new G;function hf(i,e,t,s,o){for(let l=0,c=i.length-3;l<=c;l+=3){os.fromArray(i,l);const f=o.x*Math.abs(os.x)+o.y*Math.abs(os.y)+o.z*Math.abs(os.z),h=e.dot(os),d=t.dot(os),m=s.dot(os);if(Math.max(-Math.max(h,d,m),Math.min(h,d,m))>f)return!1}return!0}const My=new Aa,oa=new G,df=new G;class ed{constructor(e=new G,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const s=this.center;t!==void 0?s.copy(t):My.setFromPoints(e).getCenter(s);let o=0;for(let l=0,c=e.length;l<c;l++)o=Math.max(o,s.distanceToSquared(e[l]));return this.radius=Math.sqrt(o),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const s=this.center.distanceToSquared(e);return t.copy(e),s>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;oa.subVectors(e,this.center);const t=oa.lengthSq();if(t>this.radius*this.radius){const s=Math.sqrt(t),o=(s-this.radius)*.5;this.center.addScaledVector(oa,o/s),this.radius+=o}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(df.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(oa.copy(e.center).add(df)),this.expandByPoint(oa.copy(e.center).sub(df))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ji=new G,pf=new G,zl=new G,Ir=new G,mf=new G,Bl=new G,gf=new G;class Ey{constructor(e=new G,t=new G(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ji)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const s=t.dot(this.direction);return s<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ji.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ji.copy(this.origin).addScaledVector(this.direction,t),Ji.distanceToSquared(e))}distanceSqToSegment(e,t,s,o){pf.copy(e).add(t).multiplyScalar(.5),zl.copy(t).sub(e).normalize(),Ir.copy(this.origin).sub(pf);const l=e.distanceTo(t)*.5,c=-this.direction.dot(zl),f=Ir.dot(this.direction),h=-Ir.dot(zl),d=Ir.lengthSq(),m=Math.abs(1-c*c);let _,g,y,M;if(m>0)if(_=c*h-f,g=c*f-h,M=l*m,_>=0)if(g>=-M)if(g<=M){const E=1/m;_*=E,g*=E,y=_*(_+c*g+2*f)+g*(c*_+g+2*h)+d}else g=l,_=Math.max(0,-(c*g+f)),y=-_*_+g*(g+2*h)+d;else g=-l,_=Math.max(0,-(c*g+f)),y=-_*_+g*(g+2*h)+d;else g<=-M?(_=Math.max(0,-(-c*l+f)),g=_>0?-l:Math.min(Math.max(-l,-h),l),y=-_*_+g*(g+2*h)+d):g<=M?(_=0,g=Math.min(Math.max(-l,-h),l),y=g*(g+2*h)+d):(_=Math.max(0,-(c*l+f)),g=_>0?l:Math.min(Math.max(-l,-h),l),y=-_*_+g*(g+2*h)+d);else g=c>0?-l:l,_=Math.max(0,-(c*g+f)),y=-_*_+g*(g+2*h)+d;return s&&s.copy(this.origin).addScaledVector(this.direction,_),o&&o.copy(pf).addScaledVector(zl,g),y}intersectSphere(e,t){Ji.subVectors(e.center,this.origin);const s=Ji.dot(this.direction),o=Ji.dot(Ji)-s*s,l=e.radius*e.radius;if(o>l)return null;const c=Math.sqrt(l-o),f=s-c,h=s+c;return h<0?null:f<0?this.at(h,t):this.at(f,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(e.normal)+e.constant)/t;return s>=0?s:null}intersectPlane(e,t){const s=this.distanceToPlane(e);return s===null?null:this.at(s,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let s,o,l,c,f,h;const d=1/this.direction.x,m=1/this.direction.y,_=1/this.direction.z,g=this.origin;return d>=0?(s=(e.min.x-g.x)*d,o=(e.max.x-g.x)*d):(s=(e.max.x-g.x)*d,o=(e.min.x-g.x)*d),m>=0?(l=(e.min.y-g.y)*m,c=(e.max.y-g.y)*m):(l=(e.max.y-g.y)*m,c=(e.min.y-g.y)*m),s>c||l>o||((l>s||isNaN(s))&&(s=l),(c<o||isNaN(o))&&(o=c),_>=0?(f=(e.min.z-g.z)*_,h=(e.max.z-g.z)*_):(f=(e.max.z-g.z)*_,h=(e.min.z-g.z)*_),s>h||f>o)||((f>s||s!==s)&&(s=f),(h<o||o!==o)&&(o=h),o<0)?null:this.at(s>=0?s:o,t)}intersectsBox(e){return this.intersectBox(e,Ji)!==null}intersectTriangle(e,t,s,o,l){mf.subVectors(t,e),Bl.subVectors(s,e),gf.crossVectors(mf,Bl);let c=this.direction.dot(gf),f;if(c>0){if(o)return null;f=1}else if(c<0)f=-1,c=-c;else return null;Ir.subVectors(this.origin,e);const h=f*this.direction.dot(Bl.crossVectors(Ir,Bl));if(h<0)return null;const d=f*this.direction.dot(mf.cross(Ir));if(d<0||h+d>c)return null;const m=-f*Ir.dot(gf);return m<0?null:this.at(m/c,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Gt{constructor(e,t,s,o,l,c,f,h,d,m,_,g,y,M,E,S){Gt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,s,o,l,c,f,h,d,m,_,g,y,M,E,S)}set(e,t,s,o,l,c,f,h,d,m,_,g,y,M,E,S){const v=this.elements;return v[0]=e,v[4]=t,v[8]=s,v[12]=o,v[1]=l,v[5]=c,v[9]=f,v[13]=h,v[2]=d,v[6]=m,v[10]=_,v[14]=g,v[3]=y,v[7]=M,v[11]=E,v[15]=S,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Gt().fromArray(this.elements)}copy(e){const t=this.elements,s=e.elements;return t[0]=s[0],t[1]=s[1],t[2]=s[2],t[3]=s[3],t[4]=s[4],t[5]=s[5],t[6]=s[6],t[7]=s[7],t[8]=s[8],t[9]=s[9],t[10]=s[10],t[11]=s[11],t[12]=s[12],t[13]=s[13],t[14]=s[14],t[15]=s[15],this}copyPosition(e){const t=this.elements,s=e.elements;return t[12]=s[12],t[13]=s[13],t[14]=s[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,s){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this}makeBasis(e,t,s){return this.set(e.x,t.x,s.x,0,e.y,t.y,s.y,0,e.z,t.z,s.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,s=e.elements,o=1/$s.setFromMatrixColumn(e,0).length(),l=1/$s.setFromMatrixColumn(e,1).length(),c=1/$s.setFromMatrixColumn(e,2).length();return t[0]=s[0]*o,t[1]=s[1]*o,t[2]=s[2]*o,t[3]=0,t[4]=s[4]*l,t[5]=s[5]*l,t[6]=s[6]*l,t[7]=0,t[8]=s[8]*c,t[9]=s[9]*c,t[10]=s[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,s=e.x,o=e.y,l=e.z,c=Math.cos(s),f=Math.sin(s),h=Math.cos(o),d=Math.sin(o),m=Math.cos(l),_=Math.sin(l);if(e.order==="XYZ"){const g=c*m,y=c*_,M=f*m,E=f*_;t[0]=h*m,t[4]=-h*_,t[8]=d,t[1]=y+M*d,t[5]=g-E*d,t[9]=-f*h,t[2]=E-g*d,t[6]=M+y*d,t[10]=c*h}else if(e.order==="YXZ"){const g=h*m,y=h*_,M=d*m,E=d*_;t[0]=g+E*f,t[4]=M*f-y,t[8]=c*d,t[1]=c*_,t[5]=c*m,t[9]=-f,t[2]=y*f-M,t[6]=E+g*f,t[10]=c*h}else if(e.order==="ZXY"){const g=h*m,y=h*_,M=d*m,E=d*_;t[0]=g-E*f,t[4]=-c*_,t[8]=M+y*f,t[1]=y+M*f,t[5]=c*m,t[9]=E-g*f,t[2]=-c*d,t[6]=f,t[10]=c*h}else if(e.order==="ZYX"){const g=c*m,y=c*_,M=f*m,E=f*_;t[0]=h*m,t[4]=M*d-y,t[8]=g*d+E,t[1]=h*_,t[5]=E*d+g,t[9]=y*d-M,t[2]=-d,t[6]=f*h,t[10]=c*h}else if(e.order==="YZX"){const g=c*h,y=c*d,M=f*h,E=f*d;t[0]=h*m,t[4]=E-g*_,t[8]=M*_+y,t[1]=_,t[5]=c*m,t[9]=-f*m,t[2]=-d*m,t[6]=y*_+M,t[10]=g-E*_}else if(e.order==="XZY"){const g=c*h,y=c*d,M=f*h,E=f*d;t[0]=h*m,t[4]=-_,t[8]=d*m,t[1]=g*_+E,t[5]=c*m,t[9]=y*_-M,t[2]=M*_-y,t[6]=f*m,t[10]=E*_+g}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(wy,e,Ty)}lookAt(e,t,s){const o=this.elements;return $n.subVectors(e,t),$n.lengthSq()===0&&($n.z=1),$n.normalize(),Ur.crossVectors(s,$n),Ur.lengthSq()===0&&(Math.abs(s.z)===1?$n.x+=1e-4:$n.z+=1e-4,$n.normalize(),Ur.crossVectors(s,$n)),Ur.normalize(),Hl.crossVectors($n,Ur),o[0]=Ur.x,o[4]=Hl.x,o[8]=$n.x,o[1]=Ur.y,o[5]=Hl.y,o[9]=$n.y,o[2]=Ur.z,o[6]=Hl.z,o[10]=$n.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const s=e.elements,o=t.elements,l=this.elements,c=s[0],f=s[4],h=s[8],d=s[12],m=s[1],_=s[5],g=s[9],y=s[13],M=s[2],E=s[6],S=s[10],v=s[14],L=s[3],R=s[7],T=s[11],B=s[15],I=o[0],O=o[4],z=o[8],P=o[12],A=o[1],U=o[5],Q=o[9],Y=o[13],ie=o[2],le=o[6],se=o[10],ce=o[14],V=o[3],ue=o[7],oe=o[11],k=o[15];return l[0]=c*I+f*A+h*ie+d*V,l[4]=c*O+f*U+h*le+d*ue,l[8]=c*z+f*Q+h*se+d*oe,l[12]=c*P+f*Y+h*ce+d*k,l[1]=m*I+_*A+g*ie+y*V,l[5]=m*O+_*U+g*le+y*ue,l[9]=m*z+_*Q+g*se+y*oe,l[13]=m*P+_*Y+g*ce+y*k,l[2]=M*I+E*A+S*ie+v*V,l[6]=M*O+E*U+S*le+v*ue,l[10]=M*z+E*Q+S*se+v*oe,l[14]=M*P+E*Y+S*ce+v*k,l[3]=L*I+R*A+T*ie+B*V,l[7]=L*O+R*U+T*le+B*ue,l[11]=L*z+R*Q+T*se+B*oe,l[15]=L*P+R*Y+T*ce+B*k,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],s=e[4],o=e[8],l=e[12],c=e[1],f=e[5],h=e[9],d=e[13],m=e[2],_=e[6],g=e[10],y=e[14],M=e[3],E=e[7],S=e[11],v=e[15];return M*(+l*h*_-o*d*_-l*f*g+s*d*g+o*f*y-s*h*y)+E*(+t*h*y-t*d*g+l*c*g-o*c*y+o*d*m-l*h*m)+S*(+t*d*_-t*f*y-l*c*_+s*c*y+l*f*m-s*d*m)+v*(-o*f*m-t*h*_+t*f*g+o*c*_-s*c*g+s*h*m)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,s){const o=this.elements;return e.isVector3?(o[12]=e.x,o[13]=e.y,o[14]=e.z):(o[12]=e,o[13]=t,o[14]=s),this}invert(){const e=this.elements,t=e[0],s=e[1],o=e[2],l=e[3],c=e[4],f=e[5],h=e[6],d=e[7],m=e[8],_=e[9],g=e[10],y=e[11],M=e[12],E=e[13],S=e[14],v=e[15],L=_*S*d-E*g*d+E*h*y-f*S*y-_*h*v+f*g*v,R=M*g*d-m*S*d-M*h*y+c*S*y+m*h*v-c*g*v,T=m*E*d-M*_*d+M*f*y-c*E*y-m*f*v+c*_*v,B=M*_*h-m*E*h-M*f*g+c*E*g+m*f*S-c*_*S,I=t*L+s*R+o*T+l*B;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/I;return e[0]=L*O,e[1]=(E*g*l-_*S*l-E*o*y+s*S*y+_*o*v-s*g*v)*O,e[2]=(f*S*l-E*h*l+E*o*d-s*S*d-f*o*v+s*h*v)*O,e[3]=(_*h*l-f*g*l-_*o*d+s*g*d+f*o*y-s*h*y)*O,e[4]=R*O,e[5]=(m*S*l-M*g*l+M*o*y-t*S*y-m*o*v+t*g*v)*O,e[6]=(M*h*l-c*S*l-M*o*d+t*S*d+c*o*v-t*h*v)*O,e[7]=(c*g*l-m*h*l+m*o*d-t*g*d-c*o*y+t*h*y)*O,e[8]=T*O,e[9]=(M*_*l-m*E*l-M*s*y+t*E*y+m*s*v-t*_*v)*O,e[10]=(c*E*l-M*f*l+M*s*d-t*E*d-c*s*v+t*f*v)*O,e[11]=(m*f*l-c*_*l-m*s*d+t*_*d+c*s*y-t*f*y)*O,e[12]=B*O,e[13]=(m*E*o-M*_*o+M*s*g-t*E*g-m*s*S+t*_*S)*O,e[14]=(M*f*o-c*E*o-M*s*h+t*E*h+c*s*S-t*f*S)*O,e[15]=(c*_*o-m*f*o+m*s*h-t*_*h-c*s*g+t*f*g)*O,this}scale(e){const t=this.elements,s=e.x,o=e.y,l=e.z;return t[0]*=s,t[4]*=o,t[8]*=l,t[1]*=s,t[5]*=o,t[9]*=l,t[2]*=s,t[6]*=o,t[10]*=l,t[3]*=s,t[7]*=o,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],s=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],o=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,s,o))}makeTranslation(e,t,s){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,s,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),s=Math.sin(e);return this.set(1,0,0,0,0,t,-s,0,0,s,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),s=Math.sin(e);return this.set(t,0,s,0,0,1,0,0,-s,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),s=Math.sin(e);return this.set(t,-s,0,0,s,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const s=Math.cos(t),o=Math.sin(t),l=1-s,c=e.x,f=e.y,h=e.z,d=l*c,m=l*f;return this.set(d*c+s,d*f-o*h,d*h+o*f,0,d*f+o*h,m*f+s,m*h-o*c,0,d*h-o*f,m*h+o*c,l*h*h+s,0,0,0,0,1),this}makeScale(e,t,s){return this.set(e,0,0,0,0,t,0,0,0,0,s,0,0,0,0,1),this}makeShear(e,t,s,o,l,c){return this.set(1,s,l,0,e,1,c,0,t,o,1,0,0,0,0,1),this}compose(e,t,s){const o=this.elements,l=t._x,c=t._y,f=t._z,h=t._w,d=l+l,m=c+c,_=f+f,g=l*d,y=l*m,M=l*_,E=c*m,S=c*_,v=f*_,L=h*d,R=h*m,T=h*_,B=s.x,I=s.y,O=s.z;return o[0]=(1-(E+v))*B,o[1]=(y+T)*B,o[2]=(M-R)*B,o[3]=0,o[4]=(y-T)*I,o[5]=(1-(g+v))*I,o[6]=(S+L)*I,o[7]=0,o[8]=(M+R)*O,o[9]=(S-L)*O,o[10]=(1-(g+E))*O,o[11]=0,o[12]=e.x,o[13]=e.y,o[14]=e.z,o[15]=1,this}decompose(e,t,s){const o=this.elements;let l=$s.set(o[0],o[1],o[2]).length();const c=$s.set(o[4],o[5],o[6]).length(),f=$s.set(o[8],o[9],o[10]).length();this.determinant()<0&&(l=-l),e.x=o[12],e.y=o[13],e.z=o[14],xi.copy(this);const d=1/l,m=1/c,_=1/f;return xi.elements[0]*=d,xi.elements[1]*=d,xi.elements[2]*=d,xi.elements[4]*=m,xi.elements[5]*=m,xi.elements[6]*=m,xi.elements[8]*=_,xi.elements[9]*=_,xi.elements[10]*=_,t.setFromRotationMatrix(xi),s.x=l,s.y=c,s.z=f,this}makePerspective(e,t,s,o,l,c,f=ar){const h=this.elements,d=2*l/(t-e),m=2*l/(s-o),_=(t+e)/(t-e),g=(s+o)/(s-o);let y,M;if(f===ar)y=-(c+l)/(c-l),M=-2*c*l/(c-l);else if(f===mc)y=-c/(c-l),M=-c*l/(c-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+f);return h[0]=d,h[4]=0,h[8]=_,h[12]=0,h[1]=0,h[5]=m,h[9]=g,h[13]=0,h[2]=0,h[6]=0,h[10]=y,h[14]=M,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,s,o,l,c,f=ar){const h=this.elements,d=1/(t-e),m=1/(s-o),_=1/(c-l),g=(t+e)*d,y=(s+o)*m;let M,E;if(f===ar)M=(c+l)*_,E=-2*_;else if(f===mc)M=l*_,E=-1*_;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+f);return h[0]=2*d,h[4]=0,h[8]=0,h[12]=-g,h[1]=0,h[5]=2*m,h[9]=0,h[13]=-y,h[2]=0,h[6]=0,h[10]=E,h[14]=-M,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const t=this.elements,s=e.elements;for(let o=0;o<16;o++)if(t[o]!==s[o])return!1;return!0}fromArray(e,t=0){for(let s=0;s<16;s++)this.elements[s]=e[s+t];return this}toArray(e=[],t=0){const s=this.elements;return e[t]=s[0],e[t+1]=s[1],e[t+2]=s[2],e[t+3]=s[3],e[t+4]=s[4],e[t+5]=s[5],e[t+6]=s[6],e[t+7]=s[7],e[t+8]=s[8],e[t+9]=s[9],e[t+10]=s[10],e[t+11]=s[11],e[t+12]=s[12],e[t+13]=s[13],e[t+14]=s[14],e[t+15]=s[15],e}}const $s=new G,xi=new Gt,wy=new G(0,0,0),Ty=new G(1,1,1),Ur=new G,Hl=new G,$n=new G,ig=new Gt,rg=new Ai;class Ci{constructor(e=0,t=0,s=0,o=Ci.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=s,this._order=o}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,s,o=this._order){return this._x=e,this._y=t,this._z=s,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,s=!0){const o=e.elements,l=o[0],c=o[4],f=o[8],h=o[1],d=o[5],m=o[9],_=o[2],g=o[6],y=o[10];switch(t){case"XYZ":this._y=Math.asin(hn(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(-m,y),this._z=Math.atan2(-c,l)):(this._x=Math.atan2(g,d),this._z=0);break;case"YXZ":this._x=Math.asin(-hn(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(f,y),this._z=Math.atan2(h,d)):(this._y=Math.atan2(-_,l),this._z=0);break;case"ZXY":this._x=Math.asin(hn(g,-1,1)),Math.abs(g)<.9999999?(this._y=Math.atan2(-_,y),this._z=Math.atan2(-c,d)):(this._y=0,this._z=Math.atan2(h,l));break;case"ZYX":this._y=Math.asin(-hn(_,-1,1)),Math.abs(_)<.9999999?(this._x=Math.atan2(g,y),this._z=Math.atan2(h,l)):(this._x=0,this._z=Math.atan2(-c,d));break;case"YZX":this._z=Math.asin(hn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-m,d),this._y=Math.atan2(-_,l)):(this._x=0,this._y=Math.atan2(f,y));break;case"XZY":this._z=Math.asin(-hn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(g,d),this._y=Math.atan2(f,l)):(this._x=Math.atan2(-m,y),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,s===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,s){return ig.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ig,t,s)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return rg.setFromEuler(this),this.setFromQuaternion(rg,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ci.DEFAULT_ORDER="XYZ";class F0{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Ay=0;const sg=new G,Zs=new Ai,er=new Gt,Vl=new G,aa=new G,Cy=new G,Ry=new Ai,og=new G(1,0,0),ag=new G(0,1,0),lg=new G(0,0,1),cg={type:"added"},Py={type:"removed"},Qs={type:"childadded",child:null},vf={type:"childremoved",child:null};class dn extends wo{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ay++}),this.uuid=ys(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=dn.DEFAULT_UP.clone();const e=new G,t=new Ci,s=new Ai,o=new G(1,1,1);function l(){s.setFromEuler(t,!1)}function c(){t.setFromQuaternion(s,void 0,!1)}t._onChange(l),s._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new Gt},normalMatrix:{value:new mt}}),this.matrix=new Gt,this.matrixWorld=new Gt,this.matrixAutoUpdate=dn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=dn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new F0,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Zs.setFromAxisAngle(e,t),this.quaternion.multiply(Zs),this}rotateOnWorldAxis(e,t){return Zs.setFromAxisAngle(e,t),this.quaternion.premultiply(Zs),this}rotateX(e){return this.rotateOnAxis(og,e)}rotateY(e){return this.rotateOnAxis(ag,e)}rotateZ(e){return this.rotateOnAxis(lg,e)}translateOnAxis(e,t){return sg.copy(e).applyQuaternion(this.quaternion),this.position.add(sg.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(og,e)}translateY(e){return this.translateOnAxis(ag,e)}translateZ(e){return this.translateOnAxis(lg,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(er.copy(this.matrixWorld).invert())}lookAt(e,t,s){e.isVector3?Vl.copy(e):Vl.set(e,t,s);const o=this.parent;this.updateWorldMatrix(!0,!1),aa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?er.lookAt(aa,Vl,this.up):er.lookAt(Vl,aa,this.up),this.quaternion.setFromRotationMatrix(er),o&&(er.extractRotation(o.matrixWorld),Zs.setFromRotationMatrix(er),this.quaternion.premultiply(Zs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(cg),Qs.child=e,this.dispatchEvent(Qs),Qs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Py),vf.child=e,this.dispatchEvent(vf),vf.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),er.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),er.multiply(e.parent.matrixWorld)),e.applyMatrix4(er),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(cg),Qs.child=e,this.dispatchEvent(Qs),Qs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let s=0,o=this.children.length;s<o;s++){const c=this.children[s].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,s=[]){this[e]===t&&s.push(this);const o=this.children;for(let l=0,c=o.length;l<c;l++)o[l].getObjectsByProperty(e,t,s);return s}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(aa,e,Cy),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(aa,Ry,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let s=0,o=t.length;s<o;s++)t[s].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let s=0,o=t.length;s<o;s++)t[s].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let s=0,o=t.length;s<o;s++)t[s].updateMatrixWorld(e)}updateWorldMatrix(e,t){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const o=this.children;for(let l=0,c=o.length;l<c;l++)o[l].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",s={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.visibility=this._visibility,o.active=this._active,o.bounds=this._bounds.map(f=>({boxInitialized:f.boxInitialized,boxMin:f.box.min.toArray(),boxMax:f.box.max.toArray(),sphereInitialized:f.sphereInitialized,sphereRadius:f.sphere.radius,sphereCenter:f.sphere.center.toArray()})),o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.geometryCount=this._geometryCount,o.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(o.boundingSphere={center:o.boundingSphere.center.toArray(),radius:o.boundingSphere.radius}),this.boundingBox!==null&&(o.boundingBox={min:o.boundingBox.min.toArray(),max:o.boundingBox.max.toArray()}));function l(f,h){return f[h.uuid]===void 0&&(f[h.uuid]=h.toJSON(e)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=l(e.geometries,this.geometry);const f=this.geometry.parameters;if(f!==void 0&&f.shapes!==void 0){const h=f.shapes;if(Array.isArray(h))for(let d=0,m=h.length;d<m;d++){const _=h[d];l(e.shapes,_)}else l(e.shapes,h)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const f=[];for(let h=0,d=this.material.length;h<d;h++)f.push(l(e.materials,this.material[h]));o.material=f}else o.material=l(e.materials,this.material);if(this.children.length>0){o.children=[];for(let f=0;f<this.children.length;f++)o.children.push(this.children[f].toJSON(e).object)}if(this.animations.length>0){o.animations=[];for(let f=0;f<this.animations.length;f++){const h=this.animations[f];o.animations.push(l(e.animations,h))}}if(t){const f=c(e.geometries),h=c(e.materials),d=c(e.textures),m=c(e.images),_=c(e.shapes),g=c(e.skeletons),y=c(e.animations),M=c(e.nodes);f.length>0&&(s.geometries=f),h.length>0&&(s.materials=h),d.length>0&&(s.textures=d),m.length>0&&(s.images=m),_.length>0&&(s.shapes=_),g.length>0&&(s.skeletons=g),y.length>0&&(s.animations=y),M.length>0&&(s.nodes=M)}return s.object=o,s;function c(f){const h=[];for(const d in f){const m=f[d];delete m.metadata,h.push(m)}return h}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let s=0;s<e.children.length;s++){const o=e.children[s];this.add(o.clone())}return this}}dn.DEFAULT_UP=new G(0,1,0);dn.DEFAULT_MATRIX_AUTO_UPDATE=!0;dn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const yi=new G,tr=new G,_f=new G,nr=new G,Js=new G,eo=new G,ug=new G,xf=new G,yf=new G,Sf=new G,Mf=new Xt,Ef=new Xt,wf=new Xt;class Si{constructor(e=new G,t=new G,s=new G){this.a=e,this.b=t,this.c=s}static getNormal(e,t,s,o){o.subVectors(s,t),yi.subVectors(e,t),o.cross(yi);const l=o.lengthSq();return l>0?o.multiplyScalar(1/Math.sqrt(l)):o.set(0,0,0)}static getBarycoord(e,t,s,o,l){yi.subVectors(o,t),tr.subVectors(s,t),_f.subVectors(e,t);const c=yi.dot(yi),f=yi.dot(tr),h=yi.dot(_f),d=tr.dot(tr),m=tr.dot(_f),_=c*d-f*f;if(_===0)return l.set(0,0,0),null;const g=1/_,y=(d*h-f*m)*g,M=(c*m-f*h)*g;return l.set(1-y-M,M,y)}static containsPoint(e,t,s,o){return this.getBarycoord(e,t,s,o,nr)===null?!1:nr.x>=0&&nr.y>=0&&nr.x+nr.y<=1}static getInterpolation(e,t,s,o,l,c,f,h){return this.getBarycoord(e,t,s,o,nr)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(l,nr.x),h.addScaledVector(c,nr.y),h.addScaledVector(f,nr.z),h)}static getInterpolatedAttribute(e,t,s,o,l,c){return Mf.setScalar(0),Ef.setScalar(0),wf.setScalar(0),Mf.fromBufferAttribute(e,t),Ef.fromBufferAttribute(e,s),wf.fromBufferAttribute(e,o),c.setScalar(0),c.addScaledVector(Mf,l.x),c.addScaledVector(Ef,l.y),c.addScaledVector(wf,l.z),c}static isFrontFacing(e,t,s,o){return yi.subVectors(s,t),tr.subVectors(e,t),yi.cross(tr).dot(o)<0}set(e,t,s){return this.a.copy(e),this.b.copy(t),this.c.copy(s),this}setFromPointsAndIndices(e,t,s,o){return this.a.copy(e[t]),this.b.copy(e[s]),this.c.copy(e[o]),this}setFromAttributeAndIndices(e,t,s,o){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,s),this.c.fromBufferAttribute(e,o),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return yi.subVectors(this.c,this.b),tr.subVectors(this.a,this.b),yi.cross(tr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Si.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Si.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,s,o,l){return Si.getInterpolation(e,this.a,this.b,this.c,t,s,o,l)}containsPoint(e){return Si.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Si.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const s=this.a,o=this.b,l=this.c;let c,f;Js.subVectors(o,s),eo.subVectors(l,s),xf.subVectors(e,s);const h=Js.dot(xf),d=eo.dot(xf);if(h<=0&&d<=0)return t.copy(s);yf.subVectors(e,o);const m=Js.dot(yf),_=eo.dot(yf);if(m>=0&&_<=m)return t.copy(o);const g=h*_-m*d;if(g<=0&&h>=0&&m<=0)return c=h/(h-m),t.copy(s).addScaledVector(Js,c);Sf.subVectors(e,l);const y=Js.dot(Sf),M=eo.dot(Sf);if(M>=0&&y<=M)return t.copy(l);const E=y*d-h*M;if(E<=0&&d>=0&&M<=0)return f=d/(d-M),t.copy(s).addScaledVector(eo,f);const S=m*M-y*_;if(S<=0&&_-m>=0&&y-M>=0)return ug.subVectors(l,o),f=(_-m)/(_-m+(y-M)),t.copy(o).addScaledVector(ug,f);const v=1/(S+E+g);return c=E*v,f=g*v,t.copy(s).addScaledVector(Js,c).addScaledVector(eo,f)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const O0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Fr={h:0,s:0,l:0},Gl={h:0,s:0,l:0};function Tf(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Mt{constructor(e,t,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,s)}set(e,t,s){if(t===void 0&&s===void 0){const o=e;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(e,t,s);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=fn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,At.toWorkingColorSpace(this,t),this}setRGB(e,t,s,o=At.workingColorSpace){return this.r=e,this.g=t,this.b=s,At.toWorkingColorSpace(this,o),this}setHSL(e,t,s,o=At.workingColorSpace){if(e=Jh(e,1),t=hn(t,0,1),s=hn(s,0,1),t===0)this.r=this.g=this.b=s;else{const l=s<=.5?s*(1+t):s+t-s*t,c=2*s-l;this.r=Tf(c,l,e+1/3),this.g=Tf(c,l,e),this.b=Tf(c,l,e-1/3)}return At.toWorkingColorSpace(this,o),this}setStyle(e,t=fn){function s(l){l!==void 0&&parseFloat(l)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const c=o[1],f=o[2];switch(c){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(f))return s(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(f))return s(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(f))return s(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=o[1],c=l.length;if(c===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(l,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=fn){const s=O0[e.toLowerCase()];return s!==void 0?this.setHex(s,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=cr(e.r),this.g=cr(e.g),this.b=cr(e.b),this}copyLinearToSRGB(e){return this.r=po(e.r),this.g=po(e.g),this.b=po(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=fn){return At.fromWorkingColorSpace(Sn.copy(this),e),Math.round(hn(Sn.r*255,0,255))*65536+Math.round(hn(Sn.g*255,0,255))*256+Math.round(hn(Sn.b*255,0,255))}getHexString(e=fn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=At.workingColorSpace){At.fromWorkingColorSpace(Sn.copy(this),t);const s=Sn.r,o=Sn.g,l=Sn.b,c=Math.max(s,o,l),f=Math.min(s,o,l);let h,d;const m=(f+c)/2;if(f===c)h=0,d=0;else{const _=c-f;switch(d=m<=.5?_/(c+f):_/(2-c-f),c){case s:h=(o-l)/_+(o<l?6:0);break;case o:h=(l-s)/_+2;break;case l:h=(s-o)/_+4;break}h/=6}return e.h=h,e.s=d,e.l=m,e}getRGB(e,t=At.workingColorSpace){return At.fromWorkingColorSpace(Sn.copy(this),t),e.r=Sn.r,e.g=Sn.g,e.b=Sn.b,e}getStyle(e=fn){At.fromWorkingColorSpace(Sn.copy(this),e);const t=Sn.r,s=Sn.g,o=Sn.b;return e!==fn?`color(${e} ${t.toFixed(3)} ${s.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(s*255)},${Math.round(o*255)})`}offsetHSL(e,t,s){return this.getHSL(Fr),this.setHSL(Fr.h+e,Fr.s+t,Fr.l+s)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,s){return this.r=e.r+(t.r-e.r)*s,this.g=e.g+(t.g-e.g)*s,this.b=e.b+(t.b-e.b)*s,this}lerpHSL(e,t){this.getHSL(Fr),e.getHSL(Gl);const s=da(Fr.h,Gl.h,t),o=da(Fr.s,Gl.s,t),l=da(Fr.l,Gl.l,t);return this.setHSL(s,o,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,s=this.g,o=this.b,l=e.elements;return this.r=l[0]*t+l[3]*s+l[6]*o,this.g=l[1]*t+l[4]*s+l[7]*o,this.b=l[2]*t+l[5]*s+l[8]*o,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Sn=new Mt;Mt.NAMES=O0;let by=0;class Ca extends wo{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:by++}),this.uuid=ys(),this.name="",this.blending=fo,this.side=Gr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$f,this.blendDst=Zf,this.blendEquation=ds,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Mt(0,0,0),this.blendAlpha=0,this.depthFunc=go,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jm,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xs,this.stencilZFail=Xs,this.stencilZPass=Xs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const s=e[t];if(s===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const o=this[t];if(o===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(s):o&&o.isVector3&&s&&s.isVector3?o.copy(s):this[t]=s}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const s={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(s.dispersion=this.dispersion),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(s.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(e).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(e).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(e).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(e).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(e).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapRotation!==void 0&&(s.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.shadowSide!==null&&(s.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),this.blending!==fo&&(s.blending=this.blending),this.side!==Gr&&(s.side=this.side),this.vertexColors===!0&&(s.vertexColors=!0),this.opacity<1&&(s.opacity=this.opacity),this.transparent===!0&&(s.transparent=!0),this.blendSrc!==$f&&(s.blendSrc=this.blendSrc),this.blendDst!==Zf&&(s.blendDst=this.blendDst),this.blendEquation!==ds&&(s.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(s.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(s.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(s.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(s.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(s.blendAlpha=this.blendAlpha),this.depthFunc!==go&&(s.depthFunc=this.depthFunc),this.depthTest===!1&&(s.depthTest=this.depthTest),this.depthWrite===!1&&(s.depthWrite=this.depthWrite),this.colorWrite===!1&&(s.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(s.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==jm&&(s.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(s.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(s.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Xs&&(s.stencilFail=this.stencilFail),this.stencilZFail!==Xs&&(s.stencilZFail=this.stencilZFail),this.stencilZPass!==Xs&&(s.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(s.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(s.rotation=this.rotation),this.polygonOffset===!0&&(s.polygonOffset=!0),this.polygonOffsetFactor!==0&&(s.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(s.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(s.linewidth=this.linewidth),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.dithering===!0&&(s.dithering=!0),this.alphaTest>0&&(s.alphaTest=this.alphaTest),this.alphaHash===!0&&(s.alphaHash=!0),this.alphaToCoverage===!0&&(s.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(s.premultipliedAlpha=!0),this.forceSinglePass===!0&&(s.forceSinglePass=!0),this.wireframe===!0&&(s.wireframe=!0),this.wireframeLinewidth>1&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(s.flatShading=!0),this.visible===!1&&(s.visible=!1),this.toneMapped===!1&&(s.toneMapped=!1),this.fog===!1&&(s.fog=!1),Object.keys(this.userData).length>0&&(s.userData=this.userData);function o(l){const c=[];for(const f in l){const h=l[f];delete h.metadata,c.push(h)}return c}if(t){const l=o(e.textures),c=o(e.images);l.length>0&&(s.textures=l),c.length>0&&(s.images=c)}return s}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let s=null;if(t!==null){const o=t.length;s=new Array(o);for(let l=0;l!==o;++l)s[l]=t[l].clone()}return this.clippingPlanes=s,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class xc extends Ca{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ci,this.combine=x0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Kt=new G,Wl=new ze;class Ti{constructor(e,t,s=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=s,this.usage=qm,this.updateRanges=[],this.gpuType=or,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,s){e*=this.itemSize,s*=t.itemSize;for(let o=0,l=this.itemSize;o<l;o++)this.array[e+o]=t.array[s+o];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,s=this.count;t<s;t++)Wl.fromBufferAttribute(this,t),Wl.applyMatrix3(e),this.setXY(t,Wl.x,Wl.y);else if(this.itemSize===3)for(let t=0,s=this.count;t<s;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix3(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyMatrix4(e){for(let t=0,s=this.count;t<s;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix4(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(e){for(let t=0,s=this.count;t<s;t++)Kt.fromBufferAttribute(this,t),Kt.applyNormalMatrix(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}transformDirection(e){for(let t=0,s=this.count;t<s;t++)Kt.fromBufferAttribute(this,t),Kt.transformDirection(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let s=this.array[e*this.itemSize+t];return this.normalized&&(s=ao(s,this.array)),s}setComponent(e,t,s){return this.normalized&&(s=Cn(s,this.array)),this.array[e*this.itemSize+t]=s,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ao(t,this.array)),t}setX(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ao(t,this.array)),t}setY(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ao(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ao(t,this.array)),t}setW(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,s){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),s=Cn(s,this.array)),this.array[e+0]=t,this.array[e+1]=s,this}setXYZ(e,t,s,o){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),s=Cn(s,this.array),o=Cn(o,this.array)),this.array[e+0]=t,this.array[e+1]=s,this.array[e+2]=o,this}setXYZW(e,t,s,o,l){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),s=Cn(s,this.array),o=Cn(o,this.array),l=Cn(l,this.array)),this.array[e+0]=t,this.array[e+1]=s,this.array[e+2]=o,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==qm&&(e.usage=this.usage),e}}class k0 extends Ti{constructor(e,t,s){super(new Uint16Array(e),t,s)}}class z0 extends Ti{constructor(e,t,s){super(new Uint32Array(e),t,s)}}class In extends Ti{constructor(e,t,s){super(new Float32Array(e),t,s)}}let Ly=0;const oi=new Gt,Af=new dn,to=new G,Zn=new Aa,la=new Aa,on=new G;class zi extends wo{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ly++}),this.uuid=ys(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(N0(e)?z0:k0)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,s=0){this.groups.push({start:e,count:t,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const l=new mt().getNormalMatrix(e);s.applyNormalMatrix(l),s.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(e),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return oi.makeRotationFromQuaternion(e),this.applyMatrix4(oi),this}rotateX(e){return oi.makeRotationX(e),this.applyMatrix4(oi),this}rotateY(e){return oi.makeRotationY(e),this.applyMatrix4(oi),this}rotateZ(e){return oi.makeRotationZ(e),this.applyMatrix4(oi),this}translate(e,t,s){return oi.makeTranslation(e,t,s),this.applyMatrix4(oi),this}scale(e,t,s){return oi.makeScale(e,t,s),this.applyMatrix4(oi),this}lookAt(e){return Af.lookAt(e),Af.updateMatrix(),this.applyMatrix4(Af.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(to).negate(),this.translate(to.x,to.y,to.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const s=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];s.push(c.x,c.y,c.z||0)}this.setAttribute("position",new In(s,3))}else{for(let s=0,o=t.count;s<o;s++){const l=e[s];t.setXYZ(s,l.x,l.y,l.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Aa);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new G(-1/0,-1/0,-1/0),new G(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const l=t[s];Zn.setFromBufferAttribute(l),this.morphTargetsRelative?(on.addVectors(this.boundingBox.min,Zn.min),this.boundingBox.expandByPoint(on),on.addVectors(this.boundingBox.max,Zn.max),this.boundingBox.expandByPoint(on)):(this.boundingBox.expandByPoint(Zn.min),this.boundingBox.expandByPoint(Zn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ed);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new G,1/0);return}if(e){const s=this.boundingSphere.center;if(Zn.setFromBufferAttribute(e),t)for(let l=0,c=t.length;l<c;l++){const f=t[l];la.setFromBufferAttribute(f),this.morphTargetsRelative?(on.addVectors(Zn.min,la.min),Zn.expandByPoint(on),on.addVectors(Zn.max,la.max),Zn.expandByPoint(on)):(Zn.expandByPoint(la.min),Zn.expandByPoint(la.max))}Zn.getCenter(s);let o=0;for(let l=0,c=e.count;l<c;l++)on.fromBufferAttribute(e,l),o=Math.max(o,s.distanceToSquared(on));if(t)for(let l=0,c=t.length;l<c;l++){const f=t[l],h=this.morphTargetsRelative;for(let d=0,m=f.count;d<m;d++)on.fromBufferAttribute(f,d),h&&(to.fromBufferAttribute(e,d),on.add(to)),o=Math.max(o,s.distanceToSquared(on))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=t.position,o=t.normal,l=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ti(new Float32Array(4*s.count),4));const c=this.getAttribute("tangent"),f=[],h=[];for(let z=0;z<s.count;z++)f[z]=new G,h[z]=new G;const d=new G,m=new G,_=new G,g=new ze,y=new ze,M=new ze,E=new G,S=new G;function v(z,P,A){d.fromBufferAttribute(s,z),m.fromBufferAttribute(s,P),_.fromBufferAttribute(s,A),g.fromBufferAttribute(l,z),y.fromBufferAttribute(l,P),M.fromBufferAttribute(l,A),m.sub(d),_.sub(d),y.sub(g),M.sub(g);const U=1/(y.x*M.y-M.x*y.y);isFinite(U)&&(E.copy(m).multiplyScalar(M.y).addScaledVector(_,-y.y).multiplyScalar(U),S.copy(_).multiplyScalar(y.x).addScaledVector(m,-M.x).multiplyScalar(U),f[z].add(E),f[P].add(E),f[A].add(E),h[z].add(S),h[P].add(S),h[A].add(S))}let L=this.groups;L.length===0&&(L=[{start:0,count:e.count}]);for(let z=0,P=L.length;z<P;++z){const A=L[z],U=A.start,Q=A.count;for(let Y=U,ie=U+Q;Y<ie;Y+=3)v(e.getX(Y+0),e.getX(Y+1),e.getX(Y+2))}const R=new G,T=new G,B=new G,I=new G;function O(z){B.fromBufferAttribute(o,z),I.copy(B);const P=f[z];R.copy(P),R.sub(B.multiplyScalar(B.dot(P))).normalize(),T.crossVectors(I,P);const U=T.dot(h[z])<0?-1:1;c.setXYZW(z,R.x,R.y,R.z,U)}for(let z=0,P=L.length;z<P;++z){const A=L[z],U=A.start,Q=A.count;for(let Y=U,ie=U+Q;Y<ie;Y+=3)O(e.getX(Y+0)),O(e.getX(Y+1)),O(e.getX(Y+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let s=this.getAttribute("normal");if(s===void 0)s=new Ti(new Float32Array(t.count*3),3),this.setAttribute("normal",s);else for(let g=0,y=s.count;g<y;g++)s.setXYZ(g,0,0,0);const o=new G,l=new G,c=new G,f=new G,h=new G,d=new G,m=new G,_=new G;if(e)for(let g=0,y=e.count;g<y;g+=3){const M=e.getX(g+0),E=e.getX(g+1),S=e.getX(g+2);o.fromBufferAttribute(t,M),l.fromBufferAttribute(t,E),c.fromBufferAttribute(t,S),m.subVectors(c,l),_.subVectors(o,l),m.cross(_),f.fromBufferAttribute(s,M),h.fromBufferAttribute(s,E),d.fromBufferAttribute(s,S),f.add(m),h.add(m),d.add(m),s.setXYZ(M,f.x,f.y,f.z),s.setXYZ(E,h.x,h.y,h.z),s.setXYZ(S,d.x,d.y,d.z)}else for(let g=0,y=t.count;g<y;g+=3)o.fromBufferAttribute(t,g+0),l.fromBufferAttribute(t,g+1),c.fromBufferAttribute(t,g+2),m.subVectors(c,l),_.subVectors(o,l),m.cross(_),s.setXYZ(g+0,m.x,m.y,m.z),s.setXYZ(g+1,m.x,m.y,m.z),s.setXYZ(g+2,m.x,m.y,m.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,s=e.count;t<s;t++)on.fromBufferAttribute(e,t),on.normalize(),e.setXYZ(t,on.x,on.y,on.z)}toNonIndexed(){function e(f,h){const d=f.array,m=f.itemSize,_=f.normalized,g=new d.constructor(h.length*m);let y=0,M=0;for(let E=0,S=h.length;E<S;E++){f.isInterleavedBufferAttribute?y=h[E]*f.data.stride+f.offset:y=h[E]*m;for(let v=0;v<m;v++)g[M++]=d[y++]}return new Ti(g,m,_)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new zi,s=this.index.array,o=this.attributes;for(const f in o){const h=o[f],d=e(h,s);t.setAttribute(f,d)}const l=this.morphAttributes;for(const f in l){const h=[],d=l[f];for(let m=0,_=d.length;m<_;m++){const g=d[m],y=e(g,s);h.push(y)}t.morphAttributes[f]=h}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let f=0,h=c.length;f<h;f++){const d=c[f];t.addGroup(d.start,d.count,d.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const h=this.parameters;for(const d in h)h[d]!==void 0&&(e[d]=h[d]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const s=this.attributes;for(const h in s){const d=s[h];e.data.attributes[h]=d.toJSON(e.data)}const o={};let l=!1;for(const h in this.morphAttributes){const d=this.morphAttributes[h],m=[];for(let _=0,g=d.length;_<g;_++){const y=d[_];m.push(y.toJSON(e.data))}m.length>0&&(o[h]=m,l=!0)}l&&(e.data.morphAttributes=o,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const f=this.boundingSphere;return f!==null&&(e.data.boundingSphere={center:f.center.toArray(),radius:f.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const s=e.index;s!==null&&this.setIndex(s.clone(t));const o=e.attributes;for(const d in o){const m=o[d];this.setAttribute(d,m.clone(t))}const l=e.morphAttributes;for(const d in l){const m=[],_=l[d];for(let g=0,y=_.length;g<y;g++)m.push(_[g].clone(t));this.morphAttributes[d]=m}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let d=0,m=c.length;d<m;d++){const _=c[d];this.addGroup(_.start,_.count,_.materialIndex)}const f=e.boundingBox;f!==null&&(this.boundingBox=f.clone());const h=e.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const fg=new Gt,as=new Ey,Xl=new ed,hg=new G,jl=new G,ql=new G,Yl=new G,Cf=new G,Kl=new G,dg=new G,$l=new G;class Nt extends dn{constructor(e=new zi,t=new xc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,s=Object.keys(t);if(s.length>0){const o=t[s[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=o.length;l<c;l++){const f=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[f]=l}}}}getVertexPosition(e,t){const s=this.geometry,o=s.attributes.position,l=s.morphAttributes.position,c=s.morphTargetsRelative;t.fromBufferAttribute(o,e);const f=this.morphTargetInfluences;if(l&&f){Kl.set(0,0,0);for(let h=0,d=l.length;h<d;h++){const m=f[h],_=l[h];m!==0&&(Cf.fromBufferAttribute(_,e),c?Kl.addScaledVector(Cf,m):Kl.addScaledVector(Cf.sub(t),m))}t.add(Kl)}return t}raycast(e,t){const s=this.geometry,o=this.material,l=this.matrixWorld;o!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),Xl.copy(s.boundingSphere),Xl.applyMatrix4(l),as.copy(e.ray).recast(e.near),!(Xl.containsPoint(as.origin)===!1&&(as.intersectSphere(Xl,hg)===null||as.origin.distanceToSquared(hg)>(e.far-e.near)**2))&&(fg.copy(l).invert(),as.copy(e.ray).applyMatrix4(fg),!(s.boundingBox!==null&&as.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(e,t,as)))}_computeIntersections(e,t,s){let o;const l=this.geometry,c=this.material,f=l.index,h=l.attributes.position,d=l.attributes.uv,m=l.attributes.uv1,_=l.attributes.normal,g=l.groups,y=l.drawRange;if(f!==null)if(Array.isArray(c))for(let M=0,E=g.length;M<E;M++){const S=g[M],v=c[S.materialIndex],L=Math.max(S.start,y.start),R=Math.min(f.count,Math.min(S.start+S.count,y.start+y.count));for(let T=L,B=R;T<B;T+=3){const I=f.getX(T),O=f.getX(T+1),z=f.getX(T+2);o=Zl(this,v,e,s,d,m,_,I,O,z),o&&(o.faceIndex=Math.floor(T/3),o.face.materialIndex=S.materialIndex,t.push(o))}}else{const M=Math.max(0,y.start),E=Math.min(f.count,y.start+y.count);for(let S=M,v=E;S<v;S+=3){const L=f.getX(S),R=f.getX(S+1),T=f.getX(S+2);o=Zl(this,c,e,s,d,m,_,L,R,T),o&&(o.faceIndex=Math.floor(S/3),t.push(o))}}else if(h!==void 0)if(Array.isArray(c))for(let M=0,E=g.length;M<E;M++){const S=g[M],v=c[S.materialIndex],L=Math.max(S.start,y.start),R=Math.min(h.count,Math.min(S.start+S.count,y.start+y.count));for(let T=L,B=R;T<B;T+=3){const I=T,O=T+1,z=T+2;o=Zl(this,v,e,s,d,m,_,I,O,z),o&&(o.faceIndex=Math.floor(T/3),o.face.materialIndex=S.materialIndex,t.push(o))}}else{const M=Math.max(0,y.start),E=Math.min(h.count,y.start+y.count);for(let S=M,v=E;S<v;S+=3){const L=S,R=S+1,T=S+2;o=Zl(this,c,e,s,d,m,_,L,R,T),o&&(o.faceIndex=Math.floor(S/3),t.push(o))}}}}function Dy(i,e,t,s,o,l,c,f){let h;if(e.side===Dn?h=s.intersectTriangle(c,l,o,!0,f):h=s.intersectTriangle(o,l,c,e.side===Gr,f),h===null)return null;$l.copy(f),$l.applyMatrix4(i.matrixWorld);const d=t.ray.origin.distanceTo($l);return d<t.near||d>t.far?null:{distance:d,point:$l.clone(),object:i}}function Zl(i,e,t,s,o,l,c,f,h,d){i.getVertexPosition(f,jl),i.getVertexPosition(h,ql),i.getVertexPosition(d,Yl);const m=Dy(i,e,t,s,jl,ql,Yl,dg);if(m){const _=new G;Si.getBarycoord(dg,jl,ql,Yl,_),o&&(m.uv=Si.getInterpolatedAttribute(o,f,h,d,_,new ze)),l&&(m.uv1=Si.getInterpolatedAttribute(l,f,h,d,_,new ze)),c&&(m.normal=Si.getInterpolatedAttribute(c,f,h,d,_,new G),m.normal.dot(s.direction)>0&&m.normal.multiplyScalar(-1));const g={a:f,b:h,c:d,normal:new G,materialIndex:0};Si.getNormal(jl,ql,Yl,g.normal),m.face=g,m.barycoord=_}return m}class Xn extends zi{constructor(e=1,t=1,s=1,o=1,l=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:s,widthSegments:o,heightSegments:l,depthSegments:c};const f=this;o=Math.floor(o),l=Math.floor(l),c=Math.floor(c);const h=[],d=[],m=[],_=[];let g=0,y=0;M("z","y","x",-1,-1,s,t,e,c,l,0),M("z","y","x",1,-1,s,t,-e,c,l,1),M("x","z","y",1,1,e,s,t,o,c,2),M("x","z","y",1,-1,e,s,-t,o,c,3),M("x","y","z",1,-1,e,t,s,o,l,4),M("x","y","z",-1,-1,e,t,-s,o,l,5),this.setIndex(h),this.setAttribute("position",new In(d,3)),this.setAttribute("normal",new In(m,3)),this.setAttribute("uv",new In(_,2));function M(E,S,v,L,R,T,B,I,O,z,P){const A=T/O,U=B/z,Q=T/2,Y=B/2,ie=I/2,le=O+1,se=z+1;let ce=0,V=0;const ue=new G;for(let oe=0;oe<se;oe++){const k=oe*U-Y;for(let ee=0;ee<le;ee++){const Fe=ee*A-Q;ue[E]=Fe*L,ue[S]=k*R,ue[v]=ie,d.push(ue.x,ue.y,ue.z),ue[E]=0,ue[S]=0,ue[v]=I>0?1:-1,m.push(ue.x,ue.y,ue.z),_.push(ee/O),_.push(1-oe/z),ce+=1}}for(let oe=0;oe<z;oe++)for(let k=0;k<O;k++){const ee=g+k+le*oe,Fe=g+k+le*(oe+1),J=g+(k+1)+le*(oe+1),he=g+(k+1)+le*oe;h.push(ee,Fe,he),h.push(Fe,J,he),V+=6}f.addGroup(y,V,P),y+=V,g+=ce}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function So(i){const e={};for(const t in i){e[t]={};for(const s in i[t]){const o=i[t][s];o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)?o.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][s]=null):e[t][s]=o.clone():Array.isArray(o)?e[t][s]=o.slice():e[t][s]=o}}return e}function Rn(i){const e={};for(let t=0;t<i.length;t++){const s=So(i[t]);for(const o in s)e[o]=s[o]}return e}function Ny(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function B0(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:At.workingColorSpace}const Iy={clone:So,merge:Rn};var Uy=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fy=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Wr extends Ca{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Uy,this.fragmentShader=Fy,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=So(e.uniforms),this.uniformsGroups=Ny(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const o in this.uniforms){const c=this.uniforms[o].value;c&&c.isTexture?t.uniforms[o]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[o]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[o]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[o]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[o]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[o]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[o]={type:"m4",value:c.toArray()}:t.uniforms[o]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const s={};for(const o in this.extensions)this.extensions[o]===!0&&(s[o]=!0);return Object.keys(s).length>0&&(t.extensions=s),t}}class H0 extends dn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Gt,this.projectionMatrix=new Gt,this.projectionMatrixInverse=new Gt,this.coordinateSystem=ar}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Or=new G,pg=new ze,mg=new ze;class li extends H0{constructor(e=50,t=1,s=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=s,this.far=o,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Sa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ha*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Sa*2*Math.atan(Math.tan(ha*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,s){Or.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Or.x,Or.y).multiplyScalar(-e/Or.z),Or.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),s.set(Or.x,Or.y).multiplyScalar(-e/Or.z)}getViewSize(e,t){return this.getViewBounds(e,pg,mg),t.subVectors(mg,pg)}setViewOffset(e,t,s,o,l,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=s,this.view.offsetY=o,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ha*.5*this.fov)/this.zoom,s=2*t,o=this.aspect*s,l=-.5*o;const c=this.view;if(this.view!==null&&this.view.enabled){const h=c.fullWidth,d=c.fullHeight;l+=c.offsetX*o/h,t-=c.offsetY*s/d,o*=c.width/h,s*=c.height/d}const f=this.filmOffset;f!==0&&(l+=e*f/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+o,t,t-s,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const no=-90,io=1;class Oy extends dn{constructor(e,t,s){super(),this.type="CubeCamera",this.renderTarget=s,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new li(no,io,e,t);o.layers=this.layers,this.add(o);const l=new li(no,io,e,t);l.layers=this.layers,this.add(l);const c=new li(no,io,e,t);c.layers=this.layers,this.add(c);const f=new li(no,io,e,t);f.layers=this.layers,this.add(f);const h=new li(no,io,e,t);h.layers=this.layers,this.add(h);const d=new li(no,io,e,t);d.layers=this.layers,this.add(d)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[s,o,l,c,f,h]=t;for(const d of t)this.remove(d);if(e===ar)s.up.set(0,1,0),s.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),f.up.set(0,1,0),f.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(e===mc)s.up.set(0,-1,0),s.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),f.up.set(0,-1,0),f.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const d of t)this.add(d),d.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:s,activeMipmapLevel:o}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,c,f,h,d,m]=this.children,_=e.getRenderTarget(),g=e.getActiveCubeFace(),y=e.getActiveMipmapLevel(),M=e.xr.enabled;e.xr.enabled=!1;const E=s.texture.generateMipmaps;s.texture.generateMipmaps=!1,e.setRenderTarget(s,0,o),e.render(t,l),e.setRenderTarget(s,1,o),e.render(t,c),e.setRenderTarget(s,2,o),e.render(t,f),e.setRenderTarget(s,3,o),e.render(t,h),e.setRenderTarget(s,4,o),e.render(t,d),s.texture.generateMipmaps=E,e.setRenderTarget(s,5,o),e.render(t,m),e.setRenderTarget(_,g,y),e.xr.enabled=M,s.texture.needsPMREMUpdate=!0}}class V0 extends Nn{constructor(e,t,s,o,l,c,f,h,d,m){e=e!==void 0?e:[],t=t!==void 0?t:vo,super(e,t,s,o,l,c,f,h,d,m),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ky extends _s{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const s={width:e,height:e,depth:1},o=[s,s,s,s,s,s];this.texture=new V0(o,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Oi}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const s={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},o=new Xn(5,5,5),l=new Wr({name:"CubemapFromEquirect",uniforms:So(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,side:Dn,blending:Hr});l.uniforms.tEquirect.value=t;const c=new Nt(o,l),f=t.minFilter;return t.minFilter===gs&&(t.minFilter=Oi),new Oy(1,10,this).update(e,c),t.minFilter=f,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,s,o){const l=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,s,o);e.setRenderTarget(l)}}const Rf=new G,zy=new G,By=new mt;class fs{constructor(e=new G(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,s,o){return this.normal.set(e,t,s),this.constant=o,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,s){const o=Rf.subVectors(s,t).cross(zy.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(o,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const s=e.delta(Rf),o=this.normal.dot(s);if(o===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const l=-(e.start.dot(this.normal)+this.constant)/o;return l<0||l>1?null:t.copy(e.start).addScaledVector(s,l)}intersectsLine(e){const t=this.distanceToPoint(e.start),s=this.distanceToPoint(e.end);return t<0&&s>0||s<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const s=t||By.getNormalMatrix(e),o=this.coplanarPoint(Rf).applyMatrix4(e),l=this.normal.applyMatrix3(s).normalize();return this.constant=-o.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ls=new ed,Ql=new G;class td{constructor(e=new fs,t=new fs,s=new fs,o=new fs,l=new fs,c=new fs){this.planes=[e,t,s,o,l,c]}set(e,t,s,o,l,c){const f=this.planes;return f[0].copy(e),f[1].copy(t),f[2].copy(s),f[3].copy(o),f[4].copy(l),f[5].copy(c),this}copy(e){const t=this.planes;for(let s=0;s<6;s++)t[s].copy(e.planes[s]);return this}setFromProjectionMatrix(e,t=ar){const s=this.planes,o=e.elements,l=o[0],c=o[1],f=o[2],h=o[3],d=o[4],m=o[5],_=o[6],g=o[7],y=o[8],M=o[9],E=o[10],S=o[11],v=o[12],L=o[13],R=o[14],T=o[15];if(s[0].setComponents(h-l,g-d,S-y,T-v).normalize(),s[1].setComponents(h+l,g+d,S+y,T+v).normalize(),s[2].setComponents(h+c,g+m,S+M,T+L).normalize(),s[3].setComponents(h-c,g-m,S-M,T-L).normalize(),s[4].setComponents(h-f,g-_,S-E,T-R).normalize(),t===ar)s[5].setComponents(h+f,g+_,S+E,T+R).normalize();else if(t===mc)s[5].setComponents(f,_,E,R).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ls.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ls.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ls)}intersectsSprite(e){return ls.center.set(0,0,0),ls.radius=.7071067811865476,ls.applyMatrix4(e.matrixWorld),this.intersectsSphere(ls)}intersectsSphere(e){const t=this.planes,s=e.center,o=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(s)<o)return!1;return!0}intersectsBox(e){const t=this.planes;for(let s=0;s<6;s++){const o=t[s];if(Ql.x=o.normal.x>0?e.max.x:e.min.x,Ql.y=o.normal.y>0?e.max.y:e.min.y,Ql.z=o.normal.z>0?e.max.z:e.min.z,o.distanceToPoint(Ql)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let s=0;s<6;s++)if(t[s].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function G0(){let i=null,e=!1,t=null,s=null;function o(l,c){t(l,c),s=i.requestAnimationFrame(o)}return{start:function(){e!==!0&&t!==null&&(s=i.requestAnimationFrame(o),e=!0)},stop:function(){i.cancelAnimationFrame(s),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){i=l}}}function Hy(i){const e=new WeakMap;function t(f,h){const d=f.array,m=f.usage,_=d.byteLength,g=i.createBuffer();i.bindBuffer(h,g),i.bufferData(h,d,m),f.onUploadCallback();let y;if(d instanceof Float32Array)y=i.FLOAT;else if(d instanceof Uint16Array)f.isFloat16BufferAttribute?y=i.HALF_FLOAT:y=i.UNSIGNED_SHORT;else if(d instanceof Int16Array)y=i.SHORT;else if(d instanceof Uint32Array)y=i.UNSIGNED_INT;else if(d instanceof Int32Array)y=i.INT;else if(d instanceof Int8Array)y=i.BYTE;else if(d instanceof Uint8Array)y=i.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)y=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:g,type:y,bytesPerElement:d.BYTES_PER_ELEMENT,version:f.version,size:_}}function s(f,h,d){const m=h.array,_=h.updateRanges;if(i.bindBuffer(d,f),_.length===0)i.bufferSubData(d,0,m);else{_.sort((y,M)=>y.start-M.start);let g=0;for(let y=1;y<_.length;y++){const M=_[g],E=_[y];E.start<=M.start+M.count+1?M.count=Math.max(M.count,E.start+E.count-M.start):(++g,_[g]=E)}_.length=g+1;for(let y=0,M=_.length;y<M;y++){const E=_[y];i.bufferSubData(d,E.start*m.BYTES_PER_ELEMENT,m,E.start,E.count)}h.clearUpdateRanges()}h.onUploadCallback()}function o(f){return f.isInterleavedBufferAttribute&&(f=f.data),e.get(f)}function l(f){f.isInterleavedBufferAttribute&&(f=f.data);const h=e.get(f);h&&(i.deleteBuffer(h.buffer),e.delete(f))}function c(f,h){if(f.isInterleavedBufferAttribute&&(f=f.data),f.isGLBufferAttribute){const m=e.get(f);(!m||m.version<f.version)&&e.set(f,{buffer:f.buffer,type:f.type,bytesPerElement:f.elementSize,version:f.version});return}const d=e.get(f);if(d===void 0)e.set(f,t(f,h));else if(d.version<f.version){if(d.size!==f.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(d.buffer,f,h),d.version=f.version}}return{get:o,remove:l,update:c}}class To extends zi{constructor(e=1,t=1,s=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:s,heightSegments:o};const l=e/2,c=t/2,f=Math.floor(s),h=Math.floor(o),d=f+1,m=h+1,_=e/f,g=t/h,y=[],M=[],E=[],S=[];for(let v=0;v<m;v++){const L=v*g-c;for(let R=0;R<d;R++){const T=R*_-l;M.push(T,-L,0),E.push(0,0,1),S.push(R/f),S.push(1-v/h)}}for(let v=0;v<h;v++)for(let L=0;L<f;L++){const R=L+d*v,T=L+d*(v+1),B=L+1+d*(v+1),I=L+1+d*v;y.push(R,T,I),y.push(T,B,I)}this.setIndex(y),this.setAttribute("position",new In(M,3)),this.setAttribute("normal",new In(E,3)),this.setAttribute("uv",new In(S,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new To(e.width,e.height,e.widthSegments,e.heightSegments)}}var Vy=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Gy=`#ifdef USE_ALPHAHASH
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
#endif`,Wy=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Xy=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jy=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qy=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Yy=`#ifdef USE_AOMAP
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
#endif`,Ky=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,$y=`#ifdef USE_BATCHING
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
#endif`,Zy=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Qy=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Jy=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,eS=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,tS=`#ifdef USE_IRIDESCENCE
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
#endif`,nS=`#ifdef USE_BUMPMAP
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
#endif`,iS=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,rS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,sS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,oS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,aS=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,lS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,cS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,uS=`#if defined( USE_COLOR_ALPHA )
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
#endif`,fS=`#define PI 3.141592653589793
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
} // validated`,hS=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,dS=`vec3 transformedNormal = objectNormal;
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
#endif`,pS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,mS=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,gS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,vS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,_S="gl_FragColor = linearToOutputTexel( gl_FragColor );",xS=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,yS=`#ifdef USE_ENVMAP
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
#endif`,SS=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,MS=`#ifdef USE_ENVMAP
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
#endif`,ES=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,wS=`#ifdef USE_ENVMAP
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
#endif`,TS=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,AS=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,CS=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,RS=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,PS=`#ifdef USE_GRADIENTMAP
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
}`,bS=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,LS=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,DS=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,NS=`uniform bool receiveShadow;
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
#endif`,IS=`#ifdef USE_ENVMAP
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
#endif`,US=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,FS=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,OS=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,kS=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,zS=`PhysicalMaterial material;
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
#endif`,BS=`struct PhysicalMaterial {
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
}`,HS=`
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
#endif`,VS=`#if defined( RE_IndirectDiffuse )
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
#endif`,GS=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,WS=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,XS=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,jS=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qS=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,YS=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,KS=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,$S=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,ZS=`#if defined( USE_POINTS_UV )
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
#endif`,QS=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,JS=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,eM=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,tM=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,nM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,iM=`#ifdef USE_MORPHTARGETS
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
#endif`,rM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,oM=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,aM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,uM=`#ifdef USE_NORMALMAP
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
#endif`,fM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,hM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,dM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,pM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,mM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,gM=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,vM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,_M=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,xM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,yM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,SM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,MM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,EM=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,wM=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,TM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,AM=`float getShadowMask() {
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
}`,CM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,RM=`#ifdef USE_SKINNING
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
#endif`,PM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,bM=`#ifdef USE_SKINNING
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
#endif`,LM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,DM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,NM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,IM=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,UM=`#ifdef USE_TRANSMISSION
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
#endif`,FM=`#ifdef USE_TRANSMISSION
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
#endif`,OM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,kM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,zM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,BM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const HM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,VM=`uniform sampler2D t2D;
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
}`,GM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,WM=`#ifdef ENVMAP_TYPE_CUBE
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
}`,XM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qM=`#include <common>
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
}`,YM=`#if DEPTH_PACKING == 3200
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
}`,KM=`#define DISTANCE
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
}`,$M=`#define DISTANCE
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
}`,ZM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,QM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,JM=`uniform float scale;
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
}`,eE=`uniform vec3 diffuse;
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
}`,tE=`#include <common>
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
}`,nE=`uniform vec3 diffuse;
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
}`,iE=`#define LAMBERT
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
}`,rE=`#define LAMBERT
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
}`,sE=`#define MATCAP
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
}`,oE=`#define MATCAP
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
}`,aE=`#define NORMAL
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
}`,lE=`#define NORMAL
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
}`,cE=`#define PHONG
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
}`,uE=`#define PHONG
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
}`,fE=`#define STANDARD
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
}`,hE=`#define STANDARD
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
}`,dE=`#define TOON
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
}`,pE=`#define TOON
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
}`,mE=`uniform float size;
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
}`,gE=`uniform vec3 diffuse;
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
}`,vE=`#include <common>
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
}`,_E=`uniform vec3 color;
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
}`,xE=`uniform float rotation;
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
}`,yE=`uniform vec3 diffuse;
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
}`,gt={alphahash_fragment:Vy,alphahash_pars_fragment:Gy,alphamap_fragment:Wy,alphamap_pars_fragment:Xy,alphatest_fragment:jy,alphatest_pars_fragment:qy,aomap_fragment:Yy,aomap_pars_fragment:Ky,batching_pars_vertex:$y,batching_vertex:Zy,begin_vertex:Qy,beginnormal_vertex:Jy,bsdfs:eS,iridescence_fragment:tS,bumpmap_pars_fragment:nS,clipping_planes_fragment:iS,clipping_planes_pars_fragment:rS,clipping_planes_pars_vertex:sS,clipping_planes_vertex:oS,color_fragment:aS,color_pars_fragment:lS,color_pars_vertex:cS,color_vertex:uS,common:fS,cube_uv_reflection_fragment:hS,defaultnormal_vertex:dS,displacementmap_pars_vertex:pS,displacementmap_vertex:mS,emissivemap_fragment:gS,emissivemap_pars_fragment:vS,colorspace_fragment:_S,colorspace_pars_fragment:xS,envmap_fragment:yS,envmap_common_pars_fragment:SS,envmap_pars_fragment:MS,envmap_pars_vertex:ES,envmap_physical_pars_fragment:IS,envmap_vertex:wS,fog_vertex:TS,fog_pars_vertex:AS,fog_fragment:CS,fog_pars_fragment:RS,gradientmap_pars_fragment:PS,lightmap_pars_fragment:bS,lights_lambert_fragment:LS,lights_lambert_pars_fragment:DS,lights_pars_begin:NS,lights_toon_fragment:US,lights_toon_pars_fragment:FS,lights_phong_fragment:OS,lights_phong_pars_fragment:kS,lights_physical_fragment:zS,lights_physical_pars_fragment:BS,lights_fragment_begin:HS,lights_fragment_maps:VS,lights_fragment_end:GS,logdepthbuf_fragment:WS,logdepthbuf_pars_fragment:XS,logdepthbuf_pars_vertex:jS,logdepthbuf_vertex:qS,map_fragment:YS,map_pars_fragment:KS,map_particle_fragment:$S,map_particle_pars_fragment:ZS,metalnessmap_fragment:QS,metalnessmap_pars_fragment:JS,morphinstance_vertex:eM,morphcolor_vertex:tM,morphnormal_vertex:nM,morphtarget_pars_vertex:iM,morphtarget_vertex:rM,normal_fragment_begin:sM,normal_fragment_maps:oM,normal_pars_fragment:aM,normal_pars_vertex:lM,normal_vertex:cM,normalmap_pars_fragment:uM,clearcoat_normal_fragment_begin:fM,clearcoat_normal_fragment_maps:hM,clearcoat_pars_fragment:dM,iridescence_pars_fragment:pM,opaque_fragment:mM,packing:gM,premultiplied_alpha_fragment:vM,project_vertex:_M,dithering_fragment:xM,dithering_pars_fragment:yM,roughnessmap_fragment:SM,roughnessmap_pars_fragment:MM,shadowmap_pars_fragment:EM,shadowmap_pars_vertex:wM,shadowmap_vertex:TM,shadowmask_pars_fragment:AM,skinbase_vertex:CM,skinning_pars_vertex:RM,skinning_vertex:PM,skinnormal_vertex:bM,specularmap_fragment:LM,specularmap_pars_fragment:DM,tonemapping_fragment:NM,tonemapping_pars_fragment:IM,transmission_fragment:UM,transmission_pars_fragment:FM,uv_pars_fragment:OM,uv_pars_vertex:kM,uv_vertex:zM,worldpos_vertex:BM,background_vert:HM,background_frag:VM,backgroundCube_vert:GM,backgroundCube_frag:WM,cube_vert:XM,cube_frag:jM,depth_vert:qM,depth_frag:YM,distanceRGBA_vert:KM,distanceRGBA_frag:$M,equirect_vert:ZM,equirect_frag:QM,linedashed_vert:JM,linedashed_frag:eE,meshbasic_vert:tE,meshbasic_frag:nE,meshlambert_vert:iE,meshlambert_frag:rE,meshmatcap_vert:sE,meshmatcap_frag:oE,meshnormal_vert:aE,meshnormal_frag:lE,meshphong_vert:cE,meshphong_frag:uE,meshphysical_vert:fE,meshphysical_frag:hE,meshtoon_vert:dE,meshtoon_frag:pE,points_vert:mE,points_frag:gE,shadow_vert:vE,shadow_frag:_E,sprite_vert:xE,sprite_frag:yE},Ie={common:{diffuse:{value:new Mt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new mt},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new mt}},envmap:{envMap:{value:null},envMapRotation:{value:new mt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new mt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new mt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new mt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new mt},normalScale:{value:new ze(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new mt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new mt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new mt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new mt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Mt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Mt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0},uvTransform:{value:new mt}},sprite:{diffuse:{value:new Mt(16777215)},opacity:{value:1},center:{value:new ze(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new mt},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0}}},Ui={basic:{uniforms:Rn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.fog]),vertexShader:gt.meshbasic_vert,fragmentShader:gt.meshbasic_frag},lambert:{uniforms:Rn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Mt(0)}}]),vertexShader:gt.meshlambert_vert,fragmentShader:gt.meshlambert_frag},phong:{uniforms:Rn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Mt(0)},specular:{value:new Mt(1118481)},shininess:{value:30}}]),vertexShader:gt.meshphong_vert,fragmentShader:gt.meshphong_frag},standard:{uniforms:Rn([Ie.common,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.roughnessmap,Ie.metalnessmap,Ie.fog,Ie.lights,{emissive:{value:new Mt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:gt.meshphysical_vert,fragmentShader:gt.meshphysical_frag},toon:{uniforms:Rn([Ie.common,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.gradientmap,Ie.fog,Ie.lights,{emissive:{value:new Mt(0)}}]),vertexShader:gt.meshtoon_vert,fragmentShader:gt.meshtoon_frag},matcap:{uniforms:Rn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,{matcap:{value:null}}]),vertexShader:gt.meshmatcap_vert,fragmentShader:gt.meshmatcap_frag},points:{uniforms:Rn([Ie.points,Ie.fog]),vertexShader:gt.points_vert,fragmentShader:gt.points_frag},dashed:{uniforms:Rn([Ie.common,Ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:gt.linedashed_vert,fragmentShader:gt.linedashed_frag},depth:{uniforms:Rn([Ie.common,Ie.displacementmap]),vertexShader:gt.depth_vert,fragmentShader:gt.depth_frag},normal:{uniforms:Rn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,{opacity:{value:1}}]),vertexShader:gt.meshnormal_vert,fragmentShader:gt.meshnormal_frag},sprite:{uniforms:Rn([Ie.sprite,Ie.fog]),vertexShader:gt.sprite_vert,fragmentShader:gt.sprite_frag},background:{uniforms:{uvTransform:{value:new mt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:gt.background_vert,fragmentShader:gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new mt}},vertexShader:gt.backgroundCube_vert,fragmentShader:gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:gt.cube_vert,fragmentShader:gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:gt.equirect_vert,fragmentShader:gt.equirect_frag},distanceRGBA:{uniforms:Rn([Ie.common,Ie.displacementmap,{referencePosition:{value:new G},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:gt.distanceRGBA_vert,fragmentShader:gt.distanceRGBA_frag},shadow:{uniforms:Rn([Ie.lights,Ie.fog,{color:{value:new Mt(0)},opacity:{value:1}}]),vertexShader:gt.shadow_vert,fragmentShader:gt.shadow_frag}};Ui.physical={uniforms:Rn([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new mt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new mt},clearcoatNormalScale:{value:new ze(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new mt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new mt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new mt},sheen:{value:0},sheenColor:{value:new Mt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new mt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new mt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new mt},transmissionSamplerSize:{value:new ze},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new mt},attenuationDistance:{value:0},attenuationColor:{value:new Mt(0)},specularColor:{value:new Mt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new mt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new mt},anisotropyVector:{value:new ze},anisotropyMap:{value:null},anisotropyMapTransform:{value:new mt}}]),vertexShader:gt.meshphysical_vert,fragmentShader:gt.meshphysical_frag};const Jl={r:0,b:0,g:0},cs=new Ci,SE=new Gt;function ME(i,e,t,s,o,l,c){const f=new Mt(0);let h=l===!0?0:1,d,m,_=null,g=0,y=null;function M(L){let R=L.isScene===!0?L.background:null;return R&&R.isTexture&&(R=(L.backgroundBlurriness>0?t:e).get(R)),R}function E(L){let R=!1;const T=M(L);T===null?v(f,h):T&&T.isColor&&(v(T,1),R=!0);const B=i.xr.getEnvironmentBlendMode();B==="additive"?s.buffers.color.setClear(0,0,0,1,c):B==="alpha-blend"&&s.buffers.color.setClear(0,0,0,0,c),(i.autoClear||R)&&(s.buffers.depth.setTest(!0),s.buffers.depth.setMask(!0),s.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function S(L,R){const T=M(R);T&&(T.isCubeTexture||T.mapping===vc)?(m===void 0&&(m=new Nt(new Xn(1,1,1),new Wr({name:"BackgroundCubeMaterial",uniforms:So(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(B,I,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),o.update(m)),cs.copy(R.backgroundRotation),cs.x*=-1,cs.y*=-1,cs.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(cs.y*=-1,cs.z*=-1),m.material.uniforms.envMap.value=T,m.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,m.material.uniforms.backgroundBlurriness.value=R.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(SE.makeRotationFromEuler(cs)),m.material.toneMapped=At.getTransfer(T.colorSpace)!==Dt,(_!==T||g!==T.version||y!==i.toneMapping)&&(m.material.needsUpdate=!0,_=T,g=T.version,y=i.toneMapping),m.layers.enableAll(),L.unshift(m,m.geometry,m.material,0,0,null)):T&&T.isTexture&&(d===void 0&&(d=new Nt(new To(2,2),new Wr({name:"BackgroundMaterial",uniforms:So(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:Gr,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),Object.defineProperty(d.material,"map",{get:function(){return this.uniforms.t2D.value}}),o.update(d)),d.material.uniforms.t2D.value=T,d.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,d.material.toneMapped=At.getTransfer(T.colorSpace)!==Dt,T.matrixAutoUpdate===!0&&T.updateMatrix(),d.material.uniforms.uvTransform.value.copy(T.matrix),(_!==T||g!==T.version||y!==i.toneMapping)&&(d.material.needsUpdate=!0,_=T,g=T.version,y=i.toneMapping),d.layers.enableAll(),L.unshift(d,d.geometry,d.material,0,0,null))}function v(L,R){L.getRGB(Jl,B0(i)),s.buffers.color.setClear(Jl.r,Jl.g,Jl.b,R,c)}return{getClearColor:function(){return f},setClearColor:function(L,R=1){f.set(L),h=R,v(f,h)},getClearAlpha:function(){return h},setClearAlpha:function(L){h=L,v(f,h)},render:E,addToRenderList:S}}function EE(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),s={},o=g(null);let l=o,c=!1;function f(A,U,Q,Y,ie){let le=!1;const se=_(Y,Q,U);l!==se&&(l=se,d(l.object)),le=y(A,Y,Q,ie),le&&M(A,Y,Q,ie),ie!==null&&e.update(ie,i.ELEMENT_ARRAY_BUFFER),(le||c)&&(c=!1,T(A,U,Q,Y),ie!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(ie).buffer))}function h(){return i.createVertexArray()}function d(A){return i.bindVertexArray(A)}function m(A){return i.deleteVertexArray(A)}function _(A,U,Q){const Y=Q.wireframe===!0;let ie=s[A.id];ie===void 0&&(ie={},s[A.id]=ie);let le=ie[U.id];le===void 0&&(le={},ie[U.id]=le);let se=le[Y];return se===void 0&&(se=g(h()),le[Y]=se),se}function g(A){const U=[],Q=[],Y=[];for(let ie=0;ie<t;ie++)U[ie]=0,Q[ie]=0,Y[ie]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:Q,attributeDivisors:Y,object:A,attributes:{},index:null}}function y(A,U,Q,Y){const ie=l.attributes,le=U.attributes;let se=0;const ce=Q.getAttributes();for(const V in ce)if(ce[V].location>=0){const oe=ie[V];let k=le[V];if(k===void 0&&(V==="instanceMatrix"&&A.instanceMatrix&&(k=A.instanceMatrix),V==="instanceColor"&&A.instanceColor&&(k=A.instanceColor)),oe===void 0||oe.attribute!==k||k&&oe.data!==k.data)return!0;se++}return l.attributesNum!==se||l.index!==Y}function M(A,U,Q,Y){const ie={},le=U.attributes;let se=0;const ce=Q.getAttributes();for(const V in ce)if(ce[V].location>=0){let oe=le[V];oe===void 0&&(V==="instanceMatrix"&&A.instanceMatrix&&(oe=A.instanceMatrix),V==="instanceColor"&&A.instanceColor&&(oe=A.instanceColor));const k={};k.attribute=oe,oe&&oe.data&&(k.data=oe.data),ie[V]=k,se++}l.attributes=ie,l.attributesNum=se,l.index=Y}function E(){const A=l.newAttributes;for(let U=0,Q=A.length;U<Q;U++)A[U]=0}function S(A){v(A,0)}function v(A,U){const Q=l.newAttributes,Y=l.enabledAttributes,ie=l.attributeDivisors;Q[A]=1,Y[A]===0&&(i.enableVertexAttribArray(A),Y[A]=1),ie[A]!==U&&(i.vertexAttribDivisor(A,U),ie[A]=U)}function L(){const A=l.newAttributes,U=l.enabledAttributes;for(let Q=0,Y=U.length;Q<Y;Q++)U[Q]!==A[Q]&&(i.disableVertexAttribArray(Q),U[Q]=0)}function R(A,U,Q,Y,ie,le,se){se===!0?i.vertexAttribIPointer(A,U,Q,ie,le):i.vertexAttribPointer(A,U,Q,Y,ie,le)}function T(A,U,Q,Y){E();const ie=Y.attributes,le=Q.getAttributes(),se=U.defaultAttributeValues;for(const ce in le){const V=le[ce];if(V.location>=0){let ue=ie[ce];if(ue===void 0&&(ce==="instanceMatrix"&&A.instanceMatrix&&(ue=A.instanceMatrix),ce==="instanceColor"&&A.instanceColor&&(ue=A.instanceColor)),ue!==void 0){const oe=ue.normalized,k=ue.itemSize,ee=e.get(ue);if(ee===void 0)continue;const Fe=ee.buffer,J=ee.type,he=ee.bytesPerElement,Me=J===i.INT||J===i.UNSIGNED_INT||ue.gpuType===qh;if(ue.isInterleavedBufferAttribute){const de=ue.data,Pe=de.stride,He=ue.offset;if(de.isInstancedInterleavedBuffer){for(let Ze=0;Ze<V.locationSize;Ze++)v(V.location+Ze,de.meshPerAttribute);A.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let Ze=0;Ze<V.locationSize;Ze++)S(V.location+Ze);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let Ze=0;Ze<V.locationSize;Ze++)R(V.location+Ze,k/V.locationSize,J,oe,Pe*he,(He+k/V.locationSize*Ze)*he,Me)}else{if(ue.isInstancedBufferAttribute){for(let de=0;de<V.locationSize;de++)v(V.location+de,ue.meshPerAttribute);A.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let de=0;de<V.locationSize;de++)S(V.location+de);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let de=0;de<V.locationSize;de++)R(V.location+de,k/V.locationSize,J,oe,k*he,k/V.locationSize*de*he,Me)}}else if(se!==void 0){const oe=se[ce];if(oe!==void 0)switch(oe.length){case 2:i.vertexAttrib2fv(V.location,oe);break;case 3:i.vertexAttrib3fv(V.location,oe);break;case 4:i.vertexAttrib4fv(V.location,oe);break;default:i.vertexAttrib1fv(V.location,oe)}}}}L()}function B(){z();for(const A in s){const U=s[A];for(const Q in U){const Y=U[Q];for(const ie in Y)m(Y[ie].object),delete Y[ie];delete U[Q]}delete s[A]}}function I(A){if(s[A.id]===void 0)return;const U=s[A.id];for(const Q in U){const Y=U[Q];for(const ie in Y)m(Y[ie].object),delete Y[ie];delete U[Q]}delete s[A.id]}function O(A){for(const U in s){const Q=s[U];if(Q[A.id]===void 0)continue;const Y=Q[A.id];for(const ie in Y)m(Y[ie].object),delete Y[ie];delete Q[A.id]}}function z(){P(),c=!0,l!==o&&(l=o,d(l.object))}function P(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:f,reset:z,resetDefaultState:P,dispose:B,releaseStatesOfGeometry:I,releaseStatesOfProgram:O,initAttributes:E,enableAttribute:S,disableUnusedAttributes:L}}function wE(i,e,t){let s;function o(d){s=d}function l(d,m){i.drawArrays(s,d,m),t.update(m,s,1)}function c(d,m,_){_!==0&&(i.drawArraysInstanced(s,d,m,_),t.update(m,s,_))}function f(d,m,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,d,0,m,0,_);let y=0;for(let M=0;M<_;M++)y+=m[M];t.update(y,s,1)}function h(d,m,_,g){if(_===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let M=0;M<d.length;M++)c(d[M],m[M],g[M]);else{y.multiDrawArraysInstancedWEBGL(s,d,0,m,0,g,0,_);let M=0;for(let E=0;E<_;E++)M+=m[E]*g[E];t.update(M,s,1)}}this.setMode=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f,this.renderMultiDrawInstances=h}function TE(i,e,t,s){let o;function l(){if(o!==void 0)return o;if(e.has("EXT_texture_filter_anisotropic")===!0){const O=e.get("EXT_texture_filter_anisotropic");o=i.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function c(O){return!(O!==Mi&&s.convert(O)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function f(O){const z=O===Ta&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(O!==ur&&s.convert(O)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==or&&!z)}function h(O){if(O==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let d=t.precision!==void 0?t.precision:"highp";const m=h(d);m!==d&&(console.warn("THREE.WebGLRenderer:",d,"not supported, using",m,"instead."),d=m);const _=t.logarithmicDepthBuffer===!0,g=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),y=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=i.getParameter(i.MAX_TEXTURE_SIZE),S=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),v=i.getParameter(i.MAX_VERTEX_ATTRIBS),L=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),R=i.getParameter(i.MAX_VARYING_VECTORS),T=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),B=M>0,I=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:h,textureFormatReadable:c,textureTypeReadable:f,precision:d,logarithmicDepthBuffer:_,reverseDepthBuffer:g,maxTextures:y,maxVertexTextures:M,maxTextureSize:E,maxCubemapSize:S,maxAttributes:v,maxVertexUniforms:L,maxVaryings:R,maxFragmentUniforms:T,vertexTextures:B,maxSamples:I}}function AE(i){const e=this;let t=null,s=0,o=!1,l=!1;const c=new fs,f=new mt,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(_,g){const y=_.length!==0||g||s!==0||o;return o=g,s=_.length,y},this.beginShadows=function(){l=!0,m(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(_,g){t=m(_,g,0)},this.setState=function(_,g,y){const M=_.clippingPlanes,E=_.clipIntersection,S=_.clipShadows,v=i.get(_);if(!o||M===null||M.length===0||l&&!S)l?m(null):d();else{const L=l?0:s,R=L*4;let T=v.clippingState||null;h.value=T,T=m(M,g,R,y);for(let B=0;B!==R;++B)T[B]=t[B];v.clippingState=T,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=L}};function d(){h.value!==t&&(h.value=t,h.needsUpdate=s>0),e.numPlanes=s,e.numIntersection=0}function m(_,g,y,M){const E=_!==null?_.length:0;let S=null;if(E!==0){if(S=h.value,M!==!0||S===null){const v=y+E*4,L=g.matrixWorldInverse;f.getNormalMatrix(L),(S===null||S.length<v)&&(S=new Float32Array(v));for(let R=0,T=y;R!==E;++R,T+=4)c.copy(_[R]).applyMatrix4(L,f),c.normal.toArray(S,T),S[T+3]=c.constant}h.value=S,h.needsUpdate=!0}return e.numPlanes=E,e.numIntersection=0,S}}function CE(i){let e=new WeakMap;function t(c,f){return f===sh?c.mapping=vo:f===oh&&(c.mapping=_o),c}function s(c){if(c&&c.isTexture){const f=c.mapping;if(f===sh||f===oh)if(e.has(c)){const h=e.get(c).texture;return t(h,c.mapping)}else{const h=c.image;if(h&&h.height>0){const d=new ky(h.height);return d.fromEquirectangularTexture(i,c),e.set(c,d),c.addEventListener("dispose",o),t(d.texture,c.mapping)}else return null}}return c}function o(c){const f=c.target;f.removeEventListener("dispose",o);const h=e.get(f);h!==void 0&&(e.delete(f),h.dispose())}function l(){e=new WeakMap}return{get:s,dispose:l}}class W0 extends H0{constructor(e=-1,t=1,s=1,o=-1,l=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=s,this.bottom=o,this.near=l,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,s,o,l,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=s,this.view.offsetY=o,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let l=s-e,c=s+e,f=o+t,h=o-t;if(this.view!==null&&this.view.enabled){const d=(this.right-this.left)/this.view.fullWidth/this.zoom,m=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=d*this.view.offsetX,c=l+d*this.view.width,f-=m*this.view.offsetY,h=f-m*this.view.height}this.projectionMatrix.makeOrthographic(l,c,f,h,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const co=4,gg=[.125,.215,.35,.446,.526,.582],ps=20,Pf=new W0,vg=new Mt;let bf=null,Lf=0,Df=0,Nf=!1;const hs=(1+Math.sqrt(5))/2,ro=1/hs,_g=[new G(-hs,ro,0),new G(hs,ro,0),new G(-ro,0,hs),new G(ro,0,hs),new G(0,hs,-ro),new G(0,hs,ro),new G(-1,1,-1),new G(1,1,-1),new G(-1,1,1),new G(1,1,1)];class xg{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,s=.1,o=100){bf=this._renderer.getRenderTarget(),Lf=this._renderer.getActiveCubeFace(),Df=this._renderer.getActiveMipmapLevel(),Nf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,s,o,l),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Mg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Sg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(bf,Lf,Df),this._renderer.xr.enabled=Nf,e.scissorTest=!1,ec(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===vo||e.mapping===_o?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),bf=this._renderer.getRenderTarget(),Lf=this._renderer.getActiveCubeFace(),Df=this._renderer.getActiveMipmapLevel(),Nf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const s=t||this._allocateTargets();return this._textureToCubeUV(e,s),this._applyPMREM(s),this._cleanup(s),s}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,s={magFilter:Oi,minFilter:Oi,generateMipmaps:!1,type:Ta,format:Mi,colorSpace:Eo,depthBuffer:!1},o=yg(e,t,s);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=yg(e,t,s);const{_lodMax:l}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=RE(l)),this._blurMaterial=PE(l,e,t)}return o}_compileMaterial(e){const t=new Nt(this._lodPlanes[0],e);this._renderer.compile(t,Pf)}_sceneToCubeUV(e,t,s,o){const f=new li(90,1,t,s),h=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],m=this._renderer,_=m.autoClear,g=m.toneMapping;m.getClearColor(vg),m.toneMapping=Vr,m.autoClear=!1;const y=new xc({name:"PMREM.Background",side:Dn,depthWrite:!1,depthTest:!1}),M=new Nt(new Xn,y);let E=!1;const S=e.background;S?S.isColor&&(y.color.copy(S),e.background=null,E=!0):(y.color.copy(vg),E=!0);for(let v=0;v<6;v++){const L=v%3;L===0?(f.up.set(0,h[v],0),f.lookAt(d[v],0,0)):L===1?(f.up.set(0,0,h[v]),f.lookAt(0,d[v],0)):(f.up.set(0,h[v],0),f.lookAt(0,0,d[v]));const R=this._cubeSize;ec(o,L*R,v>2?R:0,R,R),m.setRenderTarget(o),E&&m.render(M,f),m.render(e,f)}M.geometry.dispose(),M.material.dispose(),m.toneMapping=g,m.autoClear=_,e.background=S}_textureToCubeUV(e,t){const s=this._renderer,o=e.mapping===vo||e.mapping===_o;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=Mg()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Sg());const l=o?this._cubemapMaterial:this._equirectMaterial,c=new Nt(this._lodPlanes[0],l),f=l.uniforms;f.envMap.value=e;const h=this._cubeSize;ec(t,0,0,3*h,2*h),s.setRenderTarget(t),s.render(c,Pf)}_applyPMREM(e){const t=this._renderer,s=t.autoClear;t.autoClear=!1;const o=this._lodPlanes.length;for(let l=1;l<o;l++){const c=Math.sqrt(this._sigmas[l]*this._sigmas[l]-this._sigmas[l-1]*this._sigmas[l-1]),f=_g[(o-l-1)%_g.length];this._blur(e,l-1,l,c,f)}t.autoClear=s}_blur(e,t,s,o,l){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,s,o,"latitudinal",l),this._halfBlur(c,e,s,s,o,"longitudinal",l)}_halfBlur(e,t,s,o,l,c,f){const h=this._renderer,d=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const m=3,_=new Nt(this._lodPlanes[o],d),g=d.uniforms,y=this._sizeLods[s]-1,M=isFinite(l)?Math.PI/(2*y):2*Math.PI/(2*ps-1),E=l/M,S=isFinite(l)?1+Math.floor(m*E):ps;S>ps&&console.warn(`sigmaRadians, ${l}, is too large and will clip, as it requested ${S} samples when the maximum is set to ${ps}`);const v=[];let L=0;for(let O=0;O<ps;++O){const z=O/E,P=Math.exp(-z*z/2);v.push(P),O===0?L+=P:O<S&&(L+=2*P)}for(let O=0;O<v.length;O++)v[O]=v[O]/L;g.envMap.value=e.texture,g.samples.value=S,g.weights.value=v,g.latitudinal.value=c==="latitudinal",f&&(g.poleAxis.value=f);const{_lodMax:R}=this;g.dTheta.value=M,g.mipInt.value=R-s;const T=this._sizeLods[o],B=3*T*(o>R-co?o-R+co:0),I=4*(this._cubeSize-T);ec(t,B,I,3*T,2*T),h.setRenderTarget(t),h.render(_,Pf)}}function RE(i){const e=[],t=[],s=[];let o=i;const l=i-co+1+gg.length;for(let c=0;c<l;c++){const f=Math.pow(2,o);t.push(f);let h=1/f;c>i-co?h=gg[c-i+co-1]:c===0&&(h=0),s.push(h);const d=1/(f-2),m=-d,_=1+d,g=[m,m,_,m,_,_,m,m,_,_,m,_],y=6,M=6,E=3,S=2,v=1,L=new Float32Array(E*M*y),R=new Float32Array(S*M*y),T=new Float32Array(v*M*y);for(let I=0;I<y;I++){const O=I%3*2/3-1,z=I>2?0:-1,P=[O,z,0,O+2/3,z,0,O+2/3,z+1,0,O,z,0,O+2/3,z+1,0,O,z+1,0];L.set(P,E*M*I),R.set(g,S*M*I);const A=[I,I,I,I,I,I];T.set(A,v*M*I)}const B=new zi;B.setAttribute("position",new Ti(L,E)),B.setAttribute("uv",new Ti(R,S)),B.setAttribute("faceIndex",new Ti(T,v)),e.push(B),o>co&&o--}return{lodPlanes:e,sizeLods:t,sigmas:s}}function yg(i,e,t){const s=new _s(i,e,t);return s.texture.mapping=vc,s.texture.name="PMREM.cubeUv",s.scissorTest=!0,s}function ec(i,e,t,s,o){i.viewport.set(e,t,s,o),i.scissor.set(e,t,s,o)}function PE(i,e,t){const s=new Float32Array(ps),o=new G(0,1,0);return new Wr({name:"SphericalGaussianBlur",defines:{n:ps,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:s},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:nd(),fragmentShader:`

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
		`,blending:Hr,depthTest:!1,depthWrite:!1})}function Sg(){return new Wr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:nd(),fragmentShader:`

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
		`,blending:Hr,depthTest:!1,depthWrite:!1})}function Mg(){return new Wr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:nd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Hr,depthTest:!1,depthWrite:!1})}function nd(){return`

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
	`}function bE(i){let e=new WeakMap,t=null;function s(f){if(f&&f.isTexture){const h=f.mapping,d=h===sh||h===oh,m=h===vo||h===_o;if(d||m){let _=e.get(f);const g=_!==void 0?_.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==g)return t===null&&(t=new xg(i)),_=d?t.fromEquirectangular(f,_):t.fromCubemap(f,_),_.texture.pmremVersion=f.pmremVersion,e.set(f,_),_.texture;if(_!==void 0)return _.texture;{const y=f.image;return d&&y&&y.height>0||m&&y&&o(y)?(t===null&&(t=new xg(i)),_=d?t.fromEquirectangular(f):t.fromCubemap(f),_.texture.pmremVersion=f.pmremVersion,e.set(f,_),f.addEventListener("dispose",l),_.texture):null}}}return f}function o(f){let h=0;const d=6;for(let m=0;m<d;m++)f[m]!==void 0&&h++;return h===d}function l(f){const h=f.target;h.removeEventListener("dispose",l);const d=e.get(h);d!==void 0&&(e.delete(h),d.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:s,dispose:c}}function LE(i){const e={};function t(s){if(e[s]!==void 0)return e[s];let o;switch(s){case"WEBGL_depth_texture":o=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":o=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":o=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":o=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:o=i.getExtension(s)}return e[s]=o,o}return{has:function(s){return t(s)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(s){const o=t(s);return o===null&&ua("THREE.WebGLRenderer: "+s+" extension not supported."),o}}}function DE(i,e,t,s){const o={},l=new WeakMap;function c(_){const g=_.target;g.index!==null&&e.remove(g.index);for(const M in g.attributes)e.remove(g.attributes[M]);for(const M in g.morphAttributes){const E=g.morphAttributes[M];for(let S=0,v=E.length;S<v;S++)e.remove(E[S])}g.removeEventListener("dispose",c),delete o[g.id];const y=l.get(g);y&&(e.remove(y),l.delete(g)),s.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function f(_,g){return o[g.id]===!0||(g.addEventListener("dispose",c),o[g.id]=!0,t.memory.geometries++),g}function h(_){const g=_.attributes;for(const M in g)e.update(g[M],i.ARRAY_BUFFER);const y=_.morphAttributes;for(const M in y){const E=y[M];for(let S=0,v=E.length;S<v;S++)e.update(E[S],i.ARRAY_BUFFER)}}function d(_){const g=[],y=_.index,M=_.attributes.position;let E=0;if(y!==null){const L=y.array;E=y.version;for(let R=0,T=L.length;R<T;R+=3){const B=L[R+0],I=L[R+1],O=L[R+2];g.push(B,I,I,O,O,B)}}else if(M!==void 0){const L=M.array;E=M.version;for(let R=0,T=L.length/3-1;R<T;R+=3){const B=R+0,I=R+1,O=R+2;g.push(B,I,I,O,O,B)}}else return;const S=new(N0(g)?z0:k0)(g,1);S.version=E;const v=l.get(_);v&&e.remove(v),l.set(_,S)}function m(_){const g=l.get(_);if(g){const y=_.index;y!==null&&g.version<y.version&&d(_)}else d(_);return l.get(_)}return{get:f,update:h,getWireframeAttribute:m}}function NE(i,e,t){let s;function o(g){s=g}let l,c;function f(g){l=g.type,c=g.bytesPerElement}function h(g,y){i.drawElements(s,y,l,g*c),t.update(y,s,1)}function d(g,y,M){M!==0&&(i.drawElementsInstanced(s,y,l,g*c,M),t.update(y,s,M))}function m(g,y,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,y,0,l,g,0,M);let S=0;for(let v=0;v<M;v++)S+=y[v];t.update(S,s,1)}function _(g,y,M,E){if(M===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let v=0;v<g.length;v++)d(g[v]/c,y[v],E[v]);else{S.multiDrawElementsInstancedWEBGL(s,y,0,l,g,0,E,0,M);let v=0;for(let L=0;L<M;L++)v+=y[L]*E[L];t.update(v,s,1)}}this.setMode=o,this.setIndex=f,this.render=h,this.renderInstances=d,this.renderMultiDraw=m,this.renderMultiDrawInstances=_}function IE(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function s(l,c,f){switch(t.calls++,c){case i.TRIANGLES:t.triangles+=f*(l/3);break;case i.LINES:t.lines+=f*(l/2);break;case i.LINE_STRIP:t.lines+=f*(l-1);break;case i.LINE_LOOP:t.lines+=f*l;break;case i.POINTS:t.points+=f*l;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function o(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:o,update:s}}function UE(i,e,t){const s=new WeakMap,o=new Xt;function l(c,f,h){const d=c.morphTargetInfluences,m=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,_=m!==void 0?m.length:0;let g=s.get(f);if(g===void 0||g.count!==_){let A=function(){z.dispose(),s.delete(f),f.removeEventListener("dispose",A)};var y=A;g!==void 0&&g.texture.dispose();const M=f.morphAttributes.position!==void 0,E=f.morphAttributes.normal!==void 0,S=f.morphAttributes.color!==void 0,v=f.morphAttributes.position||[],L=f.morphAttributes.normal||[],R=f.morphAttributes.color||[];let T=0;M===!0&&(T=1),E===!0&&(T=2),S===!0&&(T=3);let B=f.attributes.position.count*T,I=1;B>e.maxTextureSize&&(I=Math.ceil(B/e.maxTextureSize),B=e.maxTextureSize);const O=new Float32Array(B*I*4*_),z=new U0(O,B,I,_);z.type=or,z.needsUpdate=!0;const P=T*4;for(let U=0;U<_;U++){const Q=v[U],Y=L[U],ie=R[U],le=B*I*4*U;for(let se=0;se<Q.count;se++){const ce=se*P;M===!0&&(o.fromBufferAttribute(Q,se),O[le+ce+0]=o.x,O[le+ce+1]=o.y,O[le+ce+2]=o.z,O[le+ce+3]=0),E===!0&&(o.fromBufferAttribute(Y,se),O[le+ce+4]=o.x,O[le+ce+5]=o.y,O[le+ce+6]=o.z,O[le+ce+7]=0),S===!0&&(o.fromBufferAttribute(ie,se),O[le+ce+8]=o.x,O[le+ce+9]=o.y,O[le+ce+10]=o.z,O[le+ce+11]=ie.itemSize===4?o.w:1)}}g={count:_,texture:z,size:new ze(B,I)},s.set(f,g),f.addEventListener("dispose",A)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)h.getUniforms().setValue(i,"morphTexture",c.morphTexture,t);else{let M=0;for(let S=0;S<d.length;S++)M+=d[S];const E=f.morphTargetsRelative?1:1-M;h.getUniforms().setValue(i,"morphTargetBaseInfluence",E),h.getUniforms().setValue(i,"morphTargetInfluences",d)}h.getUniforms().setValue(i,"morphTargetsTexture",g.texture,t),h.getUniforms().setValue(i,"morphTargetsTextureSize",g.size)}return{update:l}}function FE(i,e,t,s){let o=new WeakMap;function l(h){const d=s.render.frame,m=h.geometry,_=e.get(h,m);if(o.get(_)!==d&&(e.update(_),o.set(_,d)),h.isInstancedMesh&&(h.hasEventListener("dispose",f)===!1&&h.addEventListener("dispose",f),o.get(h)!==d&&(t.update(h.instanceMatrix,i.ARRAY_BUFFER),h.instanceColor!==null&&t.update(h.instanceColor,i.ARRAY_BUFFER),o.set(h,d))),h.isSkinnedMesh){const g=h.skeleton;o.get(g)!==d&&(g.update(),o.set(g,d))}return _}function c(){o=new WeakMap}function f(h){const d=h.target;d.removeEventListener("dispose",f),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:l,dispose:c}}class X0 extends Nn{constructor(e,t,s,o,l,c,f,h,d,m=ho){if(m!==ho&&m!==yo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");s===void 0&&m===ho&&(s=vs),s===void 0&&m===yo&&(s=xo),super(null,o,l,c,f,h,m,s,d),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=f!==void 0?f:wi,this.minFilter=h!==void 0?h:wi,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const j0=new Nn,Eg=new X0(1,1),q0=new U0,Y0=new Sy,K0=new V0,wg=[],Tg=[],Ag=new Float32Array(16),Cg=new Float32Array(9),Rg=new Float32Array(4);function Ao(i,e,t){const s=i[0];if(s<=0||s>0)return i;const o=e*t;let l=wg[o];if(l===void 0&&(l=new Float32Array(o),wg[o]=l),e!==0){s.toArray(l,0);for(let c=1,f=0;c!==e;++c)f+=t,i[c].toArray(l,f)}return l}function en(i,e){if(i.length!==e.length)return!1;for(let t=0,s=i.length;t<s;t++)if(i[t]!==e[t])return!1;return!0}function tn(i,e){for(let t=0,s=e.length;t<s;t++)i[t]=e[t]}function yc(i,e){let t=Tg[e];t===void 0&&(t=new Int32Array(e),Tg[e]=t);for(let s=0;s!==e;++s)t[s]=i.allocateTextureUnit();return t}function OE(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function kE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;i.uniform2fv(this.addr,e),tn(t,e)}}function zE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(en(t,e))return;i.uniform3fv(this.addr,e),tn(t,e)}}function BE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;i.uniform4fv(this.addr,e),tn(t,e)}}function HE(i,e){const t=this.cache,s=e.elements;if(s===void 0){if(en(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),tn(t,e)}else{if(en(t,s))return;Rg.set(s),i.uniformMatrix2fv(this.addr,!1,Rg),tn(t,s)}}function VE(i,e){const t=this.cache,s=e.elements;if(s===void 0){if(en(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),tn(t,e)}else{if(en(t,s))return;Cg.set(s),i.uniformMatrix3fv(this.addr,!1,Cg),tn(t,s)}}function GE(i,e){const t=this.cache,s=e.elements;if(s===void 0){if(en(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),tn(t,e)}else{if(en(t,s))return;Ag.set(s),i.uniformMatrix4fv(this.addr,!1,Ag),tn(t,s)}}function WE(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function XE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;i.uniform2iv(this.addr,e),tn(t,e)}}function jE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;i.uniform3iv(this.addr,e),tn(t,e)}}function qE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;i.uniform4iv(this.addr,e),tn(t,e)}}function YE(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function KE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;i.uniform2uiv(this.addr,e),tn(t,e)}}function $E(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;i.uniform3uiv(this.addr,e),tn(t,e)}}function ZE(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;i.uniform4uiv(this.addr,e),tn(t,e)}}function QE(i,e,t){const s=this.cache,o=t.allocateTextureUnit();s[0]!==o&&(i.uniform1i(this.addr,o),s[0]=o);let l;this.type===i.SAMPLER_2D_SHADOW?(Eg.compareFunction=D0,l=Eg):l=j0,t.setTexture2D(e||l,o)}function JE(i,e,t){const s=this.cache,o=t.allocateTextureUnit();s[0]!==o&&(i.uniform1i(this.addr,o),s[0]=o),t.setTexture3D(e||Y0,o)}function ew(i,e,t){const s=this.cache,o=t.allocateTextureUnit();s[0]!==o&&(i.uniform1i(this.addr,o),s[0]=o),t.setTextureCube(e||K0,o)}function tw(i,e,t){const s=this.cache,o=t.allocateTextureUnit();s[0]!==o&&(i.uniform1i(this.addr,o),s[0]=o),t.setTexture2DArray(e||q0,o)}function nw(i){switch(i){case 5126:return OE;case 35664:return kE;case 35665:return zE;case 35666:return BE;case 35674:return HE;case 35675:return VE;case 35676:return GE;case 5124:case 35670:return WE;case 35667:case 35671:return XE;case 35668:case 35672:return jE;case 35669:case 35673:return qE;case 5125:return YE;case 36294:return KE;case 36295:return $E;case 36296:return ZE;case 35678:case 36198:case 36298:case 36306:case 35682:return QE;case 35679:case 36299:case 36307:return JE;case 35680:case 36300:case 36308:case 36293:return ew;case 36289:case 36303:case 36311:case 36292:return tw}}function iw(i,e){i.uniform1fv(this.addr,e)}function rw(i,e){const t=Ao(e,this.size,2);i.uniform2fv(this.addr,t)}function sw(i,e){const t=Ao(e,this.size,3);i.uniform3fv(this.addr,t)}function ow(i,e){const t=Ao(e,this.size,4);i.uniform4fv(this.addr,t)}function aw(i,e){const t=Ao(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function lw(i,e){const t=Ao(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function cw(i,e){const t=Ao(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function uw(i,e){i.uniform1iv(this.addr,e)}function fw(i,e){i.uniform2iv(this.addr,e)}function hw(i,e){i.uniform3iv(this.addr,e)}function dw(i,e){i.uniform4iv(this.addr,e)}function pw(i,e){i.uniform1uiv(this.addr,e)}function mw(i,e){i.uniform2uiv(this.addr,e)}function gw(i,e){i.uniform3uiv(this.addr,e)}function vw(i,e){i.uniform4uiv(this.addr,e)}function _w(i,e,t){const s=this.cache,o=e.length,l=yc(t,o);en(s,l)||(i.uniform1iv(this.addr,l),tn(s,l));for(let c=0;c!==o;++c)t.setTexture2D(e[c]||j0,l[c])}function xw(i,e,t){const s=this.cache,o=e.length,l=yc(t,o);en(s,l)||(i.uniform1iv(this.addr,l),tn(s,l));for(let c=0;c!==o;++c)t.setTexture3D(e[c]||Y0,l[c])}function yw(i,e,t){const s=this.cache,o=e.length,l=yc(t,o);en(s,l)||(i.uniform1iv(this.addr,l),tn(s,l));for(let c=0;c!==o;++c)t.setTextureCube(e[c]||K0,l[c])}function Sw(i,e,t){const s=this.cache,o=e.length,l=yc(t,o);en(s,l)||(i.uniform1iv(this.addr,l),tn(s,l));for(let c=0;c!==o;++c)t.setTexture2DArray(e[c]||q0,l[c])}function Mw(i){switch(i){case 5126:return iw;case 35664:return rw;case 35665:return sw;case 35666:return ow;case 35674:return aw;case 35675:return lw;case 35676:return cw;case 5124:case 35670:return uw;case 35667:case 35671:return fw;case 35668:case 35672:return hw;case 35669:case 35673:return dw;case 5125:return pw;case 36294:return mw;case 36295:return gw;case 36296:return vw;case 35678:case 36198:case 36298:case 36306:case 35682:return _w;case 35679:case 36299:case 36307:return xw;case 35680:case 36300:case 36308:case 36293:return yw;case 36289:case 36303:case 36311:case 36292:return Sw}}class Ew{constructor(e,t,s){this.id=e,this.addr=s,this.cache=[],this.type=t.type,this.setValue=nw(t.type)}}class ww{constructor(e,t,s){this.id=e,this.addr=s,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Mw(t.type)}}class Tw{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,s){const o=this.seq;for(let l=0,c=o.length;l!==c;++l){const f=o[l];f.setValue(e,t[f.id],s)}}}const If=/(\w+)(\])?(\[|\.)?/g;function Pg(i,e){i.seq.push(e),i.map[e.id]=e}function Aw(i,e,t){const s=i.name,o=s.length;for(If.lastIndex=0;;){const l=If.exec(s),c=If.lastIndex;let f=l[1];const h=l[2]==="]",d=l[3];if(h&&(f=f|0),d===void 0||d==="["&&c+2===o){Pg(t,d===void 0?new Ew(f,i,e):new ww(f,i,e));break}else{let _=t.map[f];_===void 0&&(_=new Tw(f),Pg(t,_)),t=_}}}class pc{constructor(e,t){this.seq=[],this.map={};const s=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<s;++o){const l=e.getActiveUniform(t,o),c=e.getUniformLocation(t,l.name);Aw(l,c,this)}}setValue(e,t,s,o){const l=this.map[t];l!==void 0&&l.setValue(e,s,o)}setOptional(e,t,s){const o=t[s];o!==void 0&&this.setValue(e,s,o)}static upload(e,t,s,o){for(let l=0,c=t.length;l!==c;++l){const f=t[l],h=s[f.id];h.needsUpdate!==!1&&f.setValue(e,h.value,o)}}static seqWithValue(e,t){const s=[];for(let o=0,l=e.length;o!==l;++o){const c=e[o];c.id in t&&s.push(c)}return s}}function bg(i,e,t){const s=i.createShader(e);return i.shaderSource(s,t),i.compileShader(s),s}const Cw=37297;let Rw=0;function Pw(i,e){const t=i.split(`
`),s=[],o=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let c=o;c<l;c++){const f=c+1;s.push(`${f===e?">":" "} ${f}: ${t[c]}`)}return s.join(`
`)}const Lg=new mt;function bw(i){At._getMatrix(Lg,At.workingColorSpace,i);const e=`mat3( ${Lg.elements.map(t=>t.toFixed(4))} )`;switch(At.getTransfer(i)){case _c:return[e,"LinearTransferOETF"];case Dt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Dg(i,e,t){const s=i.getShaderParameter(e,i.COMPILE_STATUS),o=i.getShaderInfoLog(e).trim();if(s&&o==="")return"";const l=/ERROR: 0:(\d+)/.exec(o);if(l){const c=parseInt(l[1]);return t.toUpperCase()+`

`+o+`

`+Pw(i.getShaderSource(e),c)}else return o}function Lw(i,e){const t=bw(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Dw(i,e){let t;switch(e){case Nx:t="Linear";break;case Ix:t="Reinhard";break;case Ux:t="Cineon";break;case Fx:t="ACESFilmic";break;case kx:t="AgX";break;case zx:t="Neutral";break;case Ox:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const tc=new G;function Nw(){At.getLuminanceCoefficients(tc);const i=tc.x.toFixed(4),e=tc.y.toFixed(4),t=tc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Iw(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(fa).join(`
`)}function Uw(i){const e=[];for(const t in i){const s=i[t];s!==!1&&e.push("#define "+t+" "+s)}return e.join(`
`)}function Fw(i,e){const t={},s=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let o=0;o<s;o++){const l=i.getActiveAttrib(e,o),c=l.name;let f=1;l.type===i.FLOAT_MAT2&&(f=2),l.type===i.FLOAT_MAT3&&(f=3),l.type===i.FLOAT_MAT4&&(f=4),t[c]={type:l.type,location:i.getAttribLocation(e,c),locationSize:f}}return t}function fa(i){return i!==""}function Ng(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ig(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Ow=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ih(i){return i.replace(Ow,zw)}const kw=new Map;function zw(i,e){let t=gt[e];if(t===void 0){const s=kw.get(e);if(s!==void 0)t=gt[s],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,s);else throw new Error("Can not resolve #include <"+e+">")}return Ih(t)}const Bw=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ug(i){return i.replace(Bw,Hw)}function Hw(i,e,t,s){let o="";for(let l=parseInt(e);l<parseInt(t);l++)o+=s.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return o}function Fg(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function Vw(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===v0?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===_0?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===rr&&(e="SHADOWMAP_TYPE_VSM"),e}function Gw(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case vo:case _o:e="ENVMAP_TYPE_CUBE";break;case vc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Ww(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case _o:e="ENVMAP_MODE_REFRACTION";break}return e}function Xw(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case x0:e="ENVMAP_BLENDING_MULTIPLY";break;case Lx:e="ENVMAP_BLENDING_MIX";break;case Dx:e="ENVMAP_BLENDING_ADD";break}return e}function jw(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,s=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:s,maxMip:t}}function qw(i,e,t,s){const o=i.getContext(),l=t.defines;let c=t.vertexShader,f=t.fragmentShader;const h=Vw(t),d=Gw(t),m=Ww(t),_=Xw(t),g=jw(t),y=Iw(t),M=Uw(l),E=o.createProgram();let S,v,L=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(S=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(fa).join(`
`),S.length>0&&(S+=`
`),v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(fa).join(`
`),v.length>0&&(v+=`
`)):(S=[Fg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(fa).join(`
`),v=[Fg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.envMap?"#define "+m:"",t.envMap?"#define "+_:"",g?"#define CUBEUV_TEXEL_WIDTH "+g.texelWidth:"",g?"#define CUBEUV_TEXEL_HEIGHT "+g.texelHeight:"",g?"#define CUBEUV_MAX_MIP "+g.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Vr?"#define TONE_MAPPING":"",t.toneMapping!==Vr?gt.tonemapping_pars_fragment:"",t.toneMapping!==Vr?Dw("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",gt.colorspace_pars_fragment,Lw("linearToOutputTexel",t.outputColorSpace),Nw(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(fa).join(`
`)),c=Ih(c),c=Ng(c,t),c=Ig(c,t),f=Ih(f),f=Ng(f,t),f=Ig(f,t),c=Ug(c),f=Ug(f),t.isRawShaderMaterial!==!0&&(L=`#version 300 es
`,S=[y,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+S,v=["#define varying in",t.glslVersion===Ym?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ym?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const R=L+S+c,T=L+v+f,B=bg(o,o.VERTEX_SHADER,R),I=bg(o,o.FRAGMENT_SHADER,T);o.attachShader(E,B),o.attachShader(E,I),t.index0AttributeName!==void 0?o.bindAttribLocation(E,0,t.index0AttributeName):t.morphTargets===!0&&o.bindAttribLocation(E,0,"position"),o.linkProgram(E);function O(U){if(i.debug.checkShaderErrors){const Q=o.getProgramInfoLog(E).trim(),Y=o.getShaderInfoLog(B).trim(),ie=o.getShaderInfoLog(I).trim();let le=!0,se=!0;if(o.getProgramParameter(E,o.LINK_STATUS)===!1)if(le=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(o,E,B,I);else{const ce=Dg(o,B,"vertex"),V=Dg(o,I,"fragment");console.error("THREE.WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(E,o.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+Q+`
`+ce+`
`+V)}else Q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Q):(Y===""||ie==="")&&(se=!1);se&&(U.diagnostics={runnable:le,programLog:Q,vertexShader:{log:Y,prefix:S},fragmentShader:{log:ie,prefix:v}})}o.deleteShader(B),o.deleteShader(I),z=new pc(o,E),P=Fw(o,E)}let z;this.getUniforms=function(){return z===void 0&&O(this),z};let P;this.getAttributes=function(){return P===void 0&&O(this),P};let A=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=o.getProgramParameter(E,Cw)),A},this.destroy=function(){s.releaseStatesOfProgram(this),o.deleteProgram(E),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Rw++,this.cacheKey=e,this.usedTimes=1,this.program=E,this.vertexShader=B,this.fragmentShader=I,this}let Yw=0;class Kw{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,s=e.fragmentShader,o=this._getShaderStage(t),l=this._getShaderStage(s),c=this._getShaderCacheForMaterial(e);return c.has(o)===!1&&(c.add(o),o.usedTimes++),c.has(l)===!1&&(c.add(l),l.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const s of t)s.usedTimes--,s.usedTimes===0&&this.shaderCache.delete(s.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let s=t.get(e);return s===void 0&&(s=new Set,t.set(e,s)),s}_getShaderStage(e){const t=this.shaderCache;let s=t.get(e);return s===void 0&&(s=new $w(e),t.set(e,s)),s}}class $w{constructor(e){this.id=Yw++,this.code=e,this.usedTimes=0}}function Zw(i,e,t,s,o,l,c){const f=new F0,h=new Kw,d=new Set,m=[],_=o.logarithmicDepthBuffer,g=o.vertexTextures;let y=o.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function E(P){return d.add(P),P===0?"uv":`uv${P}`}function S(P,A,U,Q,Y){const ie=Q.fog,le=Y.geometry,se=P.isMeshStandardMaterial?Q.environment:null,ce=(P.isMeshStandardMaterial?t:e).get(P.envMap||se),V=ce&&ce.mapping===vc?ce.image.height:null,ue=M[P.type];P.precision!==null&&(y=o.getMaxPrecision(P.precision),y!==P.precision&&console.warn("THREE.WebGLProgram.getParameters:",P.precision,"not supported, using",y,"instead."));const oe=le.morphAttributes.position||le.morphAttributes.normal||le.morphAttributes.color,k=oe!==void 0?oe.length:0;let ee=0;le.morphAttributes.position!==void 0&&(ee=1),le.morphAttributes.normal!==void 0&&(ee=2),le.morphAttributes.color!==void 0&&(ee=3);let Fe,J,he,Me;if(ue){const Et=Ui[ue];Fe=Et.vertexShader,J=Et.fragmentShader}else Fe=P.vertexShader,J=P.fragmentShader,h.update(P),he=h.getVertexShaderID(P),Me=h.getFragmentShaderID(P);const de=i.getRenderTarget(),Pe=i.state.buffers.depth.getReversed(),He=Y.isInstancedMesh===!0,Ze=Y.isBatchedMesh===!0,vt=!!P.map,ve=!!P.matcap,Ae=!!ce,F=!!P.aoMap,Qe=!!P.lightMap,Ee=!!P.bumpMap,Ve=!!P.normalMap,be=!!P.displacementMap,it=!!P.emissiveMap,Oe=!!P.metalnessMap,D=!!P.roughnessMap,C=P.anisotropy>0,$=P.clearcoat>0,pe=P.dispersion>0,_e=P.iridescence>0,me=P.sheen>0,Ye=P.transmission>0,De=C&&!!P.anisotropyMap,Ge=$&&!!P.clearcoatMap,dt=$&&!!P.clearcoatNormalMap,we=$&&!!P.clearcoatRoughnessMap,Xe=_e&&!!P.iridescenceMap,ot=_e&&!!P.iridescenceThicknessMap,at=me&&!!P.sheenColorMap,je=me&&!!P.sheenRoughnessMap,_t=!!P.specularMap,ft=!!P.specularColorMap,bt=!!P.specularIntensityMap,X=Ye&&!!P.transmissionMap,Ne=Ye&&!!P.thicknessMap,ae=!!P.gradientMap,ge=!!P.alphaMap,ke=P.alphaTest>0,Ue=!!P.alphaHash,ht=!!P.extensions;let Ft=Vr;P.toneMapped&&(de===null||de.isXRRenderTarget===!0)&&(Ft=i.toneMapping);const $t={shaderID:ue,shaderType:P.type,shaderName:P.name,vertexShader:Fe,fragmentShader:J,defines:P.defines,customVertexShaderID:he,customFragmentShaderID:Me,isRawShaderMaterial:P.isRawShaderMaterial===!0,glslVersion:P.glslVersion,precision:y,batching:Ze,batchingColor:Ze&&Y._colorsTexture!==null,instancing:He,instancingColor:He&&Y.instanceColor!==null,instancingMorph:He&&Y.morphTexture!==null,supportsVertexTextures:g,outputColorSpace:de===null?i.outputColorSpace:de.isXRRenderTarget===!0?de.texture.colorSpace:Eo,alphaToCoverage:!!P.alphaToCoverage,map:vt,matcap:ve,envMap:Ae,envMapMode:Ae&&ce.mapping,envMapCubeUVHeight:V,aoMap:F,lightMap:Qe,bumpMap:Ee,normalMap:Ve,displacementMap:g&&be,emissiveMap:it,normalMapObjectSpace:Ve&&P.normalMapType===Gx,normalMapTangentSpace:Ve&&P.normalMapType===L0,metalnessMap:Oe,roughnessMap:D,anisotropy:C,anisotropyMap:De,clearcoat:$,clearcoatMap:Ge,clearcoatNormalMap:dt,clearcoatRoughnessMap:we,dispersion:pe,iridescence:_e,iridescenceMap:Xe,iridescenceThicknessMap:ot,sheen:me,sheenColorMap:at,sheenRoughnessMap:je,specularMap:_t,specularColorMap:ft,specularIntensityMap:bt,transmission:Ye,transmissionMap:X,thicknessMap:Ne,gradientMap:ae,opaque:P.transparent===!1&&P.blending===fo&&P.alphaToCoverage===!1,alphaMap:ge,alphaTest:ke,alphaHash:Ue,combine:P.combine,mapUv:vt&&E(P.map.channel),aoMapUv:F&&E(P.aoMap.channel),lightMapUv:Qe&&E(P.lightMap.channel),bumpMapUv:Ee&&E(P.bumpMap.channel),normalMapUv:Ve&&E(P.normalMap.channel),displacementMapUv:be&&E(P.displacementMap.channel),emissiveMapUv:it&&E(P.emissiveMap.channel),metalnessMapUv:Oe&&E(P.metalnessMap.channel),roughnessMapUv:D&&E(P.roughnessMap.channel),anisotropyMapUv:De&&E(P.anisotropyMap.channel),clearcoatMapUv:Ge&&E(P.clearcoatMap.channel),clearcoatNormalMapUv:dt&&E(P.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:we&&E(P.clearcoatRoughnessMap.channel),iridescenceMapUv:Xe&&E(P.iridescenceMap.channel),iridescenceThicknessMapUv:ot&&E(P.iridescenceThicknessMap.channel),sheenColorMapUv:at&&E(P.sheenColorMap.channel),sheenRoughnessMapUv:je&&E(P.sheenRoughnessMap.channel),specularMapUv:_t&&E(P.specularMap.channel),specularColorMapUv:ft&&E(P.specularColorMap.channel),specularIntensityMapUv:bt&&E(P.specularIntensityMap.channel),transmissionMapUv:X&&E(P.transmissionMap.channel),thicknessMapUv:Ne&&E(P.thicknessMap.channel),alphaMapUv:ge&&E(P.alphaMap.channel),vertexTangents:!!le.attributes.tangent&&(Ve||C),vertexColors:P.vertexColors,vertexAlphas:P.vertexColors===!0&&!!le.attributes.color&&le.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!le.attributes.uv&&(vt||ge),fog:!!ie,useFog:P.fog===!0,fogExp2:!!ie&&ie.isFogExp2,flatShading:P.flatShading===!0,sizeAttenuation:P.sizeAttenuation===!0,logarithmicDepthBuffer:_,reverseDepthBuffer:Pe,skinning:Y.isSkinnedMesh===!0,morphTargets:le.morphAttributes.position!==void 0,morphNormals:le.morphAttributes.normal!==void 0,morphColors:le.morphAttributes.color!==void 0,morphTargetsCount:k,morphTextureStride:ee,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:P.dithering,shadowMapEnabled:i.shadowMap.enabled&&U.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ft,decodeVideoTexture:vt&&P.map.isVideoTexture===!0&&At.getTransfer(P.map.colorSpace)===Dt,decodeVideoTextureEmissive:it&&P.emissiveMap.isVideoTexture===!0&&At.getTransfer(P.emissiveMap.colorSpace)===Dt,premultipliedAlpha:P.premultipliedAlpha,doubleSided:P.side===ci,flipSided:P.side===Dn,useDepthPacking:P.depthPacking>=0,depthPacking:P.depthPacking||0,index0AttributeName:P.index0AttributeName,extensionClipCullDistance:ht&&P.extensions.clipCullDistance===!0&&s.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ht&&P.extensions.multiDraw===!0||Ze)&&s.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:s.has("KHR_parallel_shader_compile"),customProgramCacheKey:P.customProgramCacheKey()};return $t.vertexUv1s=d.has(1),$t.vertexUv2s=d.has(2),$t.vertexUv3s=d.has(3),d.clear(),$t}function v(P){const A=[];if(P.shaderID?A.push(P.shaderID):(A.push(P.customVertexShaderID),A.push(P.customFragmentShaderID)),P.defines!==void 0)for(const U in P.defines)A.push(U),A.push(P.defines[U]);return P.isRawShaderMaterial===!1&&(L(A,P),R(A,P),A.push(i.outputColorSpace)),A.push(P.customProgramCacheKey),A.join()}function L(P,A){P.push(A.precision),P.push(A.outputColorSpace),P.push(A.envMapMode),P.push(A.envMapCubeUVHeight),P.push(A.mapUv),P.push(A.alphaMapUv),P.push(A.lightMapUv),P.push(A.aoMapUv),P.push(A.bumpMapUv),P.push(A.normalMapUv),P.push(A.displacementMapUv),P.push(A.emissiveMapUv),P.push(A.metalnessMapUv),P.push(A.roughnessMapUv),P.push(A.anisotropyMapUv),P.push(A.clearcoatMapUv),P.push(A.clearcoatNormalMapUv),P.push(A.clearcoatRoughnessMapUv),P.push(A.iridescenceMapUv),P.push(A.iridescenceThicknessMapUv),P.push(A.sheenColorMapUv),P.push(A.sheenRoughnessMapUv),P.push(A.specularMapUv),P.push(A.specularColorMapUv),P.push(A.specularIntensityMapUv),P.push(A.transmissionMapUv),P.push(A.thicknessMapUv),P.push(A.combine),P.push(A.fogExp2),P.push(A.sizeAttenuation),P.push(A.morphTargetsCount),P.push(A.morphAttributeCount),P.push(A.numDirLights),P.push(A.numPointLights),P.push(A.numSpotLights),P.push(A.numSpotLightMaps),P.push(A.numHemiLights),P.push(A.numRectAreaLights),P.push(A.numDirLightShadows),P.push(A.numPointLightShadows),P.push(A.numSpotLightShadows),P.push(A.numSpotLightShadowsWithMaps),P.push(A.numLightProbes),P.push(A.shadowMapType),P.push(A.toneMapping),P.push(A.numClippingPlanes),P.push(A.numClipIntersection),P.push(A.depthPacking)}function R(P,A){f.disableAll(),A.supportsVertexTextures&&f.enable(0),A.instancing&&f.enable(1),A.instancingColor&&f.enable(2),A.instancingMorph&&f.enable(3),A.matcap&&f.enable(4),A.envMap&&f.enable(5),A.normalMapObjectSpace&&f.enable(6),A.normalMapTangentSpace&&f.enable(7),A.clearcoat&&f.enable(8),A.iridescence&&f.enable(9),A.alphaTest&&f.enable(10),A.vertexColors&&f.enable(11),A.vertexAlphas&&f.enable(12),A.vertexUv1s&&f.enable(13),A.vertexUv2s&&f.enable(14),A.vertexUv3s&&f.enable(15),A.vertexTangents&&f.enable(16),A.anisotropy&&f.enable(17),A.alphaHash&&f.enable(18),A.batching&&f.enable(19),A.dispersion&&f.enable(20),A.batchingColor&&f.enable(21),P.push(f.mask),f.disableAll(),A.fog&&f.enable(0),A.useFog&&f.enable(1),A.flatShading&&f.enable(2),A.logarithmicDepthBuffer&&f.enable(3),A.reverseDepthBuffer&&f.enable(4),A.skinning&&f.enable(5),A.morphTargets&&f.enable(6),A.morphNormals&&f.enable(7),A.morphColors&&f.enable(8),A.premultipliedAlpha&&f.enable(9),A.shadowMapEnabled&&f.enable(10),A.doubleSided&&f.enable(11),A.flipSided&&f.enable(12),A.useDepthPacking&&f.enable(13),A.dithering&&f.enable(14),A.transmission&&f.enable(15),A.sheen&&f.enable(16),A.opaque&&f.enable(17),A.pointsUvs&&f.enable(18),A.decodeVideoTexture&&f.enable(19),A.decodeVideoTextureEmissive&&f.enable(20),A.alphaToCoverage&&f.enable(21),P.push(f.mask)}function T(P){const A=M[P.type];let U;if(A){const Q=Ui[A];U=Iy.clone(Q.uniforms)}else U=P.uniforms;return U}function B(P,A){let U;for(let Q=0,Y=m.length;Q<Y;Q++){const ie=m[Q];if(ie.cacheKey===A){U=ie,++U.usedTimes;break}}return U===void 0&&(U=new qw(i,A,P,l),m.push(U)),U}function I(P){if(--P.usedTimes===0){const A=m.indexOf(P);m[A]=m[m.length-1],m.pop(),P.destroy()}}function O(P){h.remove(P)}function z(){h.dispose()}return{getParameters:S,getProgramCacheKey:v,getUniforms:T,acquireProgram:B,releaseProgram:I,releaseShaderCache:O,programs:m,dispose:z}}function Qw(){let i=new WeakMap;function e(c){return i.has(c)}function t(c){let f=i.get(c);return f===void 0&&(f={},i.set(c,f)),f}function s(c){i.delete(c)}function o(c,f,h){i.get(c)[f]=h}function l(){i=new WeakMap}return{has:e,get:t,remove:s,update:o,dispose:l}}function Jw(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Og(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function kg(){const i=[];let e=0;const t=[],s=[],o=[];function l(){e=0,t.length=0,s.length=0,o.length=0}function c(_,g,y,M,E,S){let v=i[e];return v===void 0?(v={id:_.id,object:_,geometry:g,material:y,groupOrder:M,renderOrder:_.renderOrder,z:E,group:S},i[e]=v):(v.id=_.id,v.object=_,v.geometry=g,v.material=y,v.groupOrder=M,v.renderOrder=_.renderOrder,v.z=E,v.group=S),e++,v}function f(_,g,y,M,E,S){const v=c(_,g,y,M,E,S);y.transmission>0?s.push(v):y.transparent===!0?o.push(v):t.push(v)}function h(_,g,y,M,E,S){const v=c(_,g,y,M,E,S);y.transmission>0?s.unshift(v):y.transparent===!0?o.unshift(v):t.unshift(v)}function d(_,g){t.length>1&&t.sort(_||Jw),s.length>1&&s.sort(g||Og),o.length>1&&o.sort(g||Og)}function m(){for(let _=e,g=i.length;_<g;_++){const y=i[_];if(y.id===null)break;y.id=null,y.object=null,y.geometry=null,y.material=null,y.group=null}}return{opaque:t,transmissive:s,transparent:o,init:l,push:f,unshift:h,finish:m,sort:d}}function e1(){let i=new WeakMap;function e(s,o){const l=i.get(s);let c;return l===void 0?(c=new kg,i.set(s,[c])):o>=l.length?(c=new kg,l.push(c)):c=l[o],c}function t(){i=new WeakMap}return{get:e,dispose:t}}function t1(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new G,color:new Mt};break;case"SpotLight":t={position:new G,direction:new G,color:new Mt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new G,color:new Mt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new G,skyColor:new Mt,groundColor:new Mt};break;case"RectAreaLight":t={color:new Mt,position:new G,halfWidth:new G,halfHeight:new G};break}return i[e.id]=t,t}}}function n1(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let i1=0;function r1(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function s1(i){const e=new t1,t=n1(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let d=0;d<9;d++)s.probe.push(new G);const o=new G,l=new Gt,c=new Gt;function f(d){let m=0,_=0,g=0;for(let P=0;P<9;P++)s.probe[P].set(0,0,0);let y=0,M=0,E=0,S=0,v=0,L=0,R=0,T=0,B=0,I=0,O=0;d.sort(r1);for(let P=0,A=d.length;P<A;P++){const U=d[P],Q=U.color,Y=U.intensity,ie=U.distance,le=U.shadow&&U.shadow.map?U.shadow.map.texture:null;if(U.isAmbientLight)m+=Q.r*Y,_+=Q.g*Y,g+=Q.b*Y;else if(U.isLightProbe){for(let se=0;se<9;se++)s.probe[se].addScaledVector(U.sh.coefficients[se],Y);O++}else if(U.isDirectionalLight){const se=e.get(U);if(se.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const ce=U.shadow,V=t.get(U);V.shadowIntensity=ce.intensity,V.shadowBias=ce.bias,V.shadowNormalBias=ce.normalBias,V.shadowRadius=ce.radius,V.shadowMapSize=ce.mapSize,s.directionalShadow[y]=V,s.directionalShadowMap[y]=le,s.directionalShadowMatrix[y]=U.shadow.matrix,L++}s.directional[y]=se,y++}else if(U.isSpotLight){const se=e.get(U);se.position.setFromMatrixPosition(U.matrixWorld),se.color.copy(Q).multiplyScalar(Y),se.distance=ie,se.coneCos=Math.cos(U.angle),se.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),se.decay=U.decay,s.spot[E]=se;const ce=U.shadow;if(U.map&&(s.spotLightMap[B]=U.map,B++,ce.updateMatrices(U),U.castShadow&&I++),s.spotLightMatrix[E]=ce.matrix,U.castShadow){const V=t.get(U);V.shadowIntensity=ce.intensity,V.shadowBias=ce.bias,V.shadowNormalBias=ce.normalBias,V.shadowRadius=ce.radius,V.shadowMapSize=ce.mapSize,s.spotShadow[E]=V,s.spotShadowMap[E]=le,T++}E++}else if(U.isRectAreaLight){const se=e.get(U);se.color.copy(Q).multiplyScalar(Y),se.halfWidth.set(U.width*.5,0,0),se.halfHeight.set(0,U.height*.5,0),s.rectArea[S]=se,S++}else if(U.isPointLight){const se=e.get(U);if(se.color.copy(U.color).multiplyScalar(U.intensity),se.distance=U.distance,se.decay=U.decay,U.castShadow){const ce=U.shadow,V=t.get(U);V.shadowIntensity=ce.intensity,V.shadowBias=ce.bias,V.shadowNormalBias=ce.normalBias,V.shadowRadius=ce.radius,V.shadowMapSize=ce.mapSize,V.shadowCameraNear=ce.camera.near,V.shadowCameraFar=ce.camera.far,s.pointShadow[M]=V,s.pointShadowMap[M]=le,s.pointShadowMatrix[M]=U.shadow.matrix,R++}s.point[M]=se,M++}else if(U.isHemisphereLight){const se=e.get(U);se.skyColor.copy(U.color).multiplyScalar(Y),se.groundColor.copy(U.groundColor).multiplyScalar(Y),s.hemi[v]=se,v++}}S>0&&(i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=Ie.LTC_FLOAT_1,s.rectAreaLTC2=Ie.LTC_FLOAT_2):(s.rectAreaLTC1=Ie.LTC_HALF_1,s.rectAreaLTC2=Ie.LTC_HALF_2)),s.ambient[0]=m,s.ambient[1]=_,s.ambient[2]=g;const z=s.hash;(z.directionalLength!==y||z.pointLength!==M||z.spotLength!==E||z.rectAreaLength!==S||z.hemiLength!==v||z.numDirectionalShadows!==L||z.numPointShadows!==R||z.numSpotShadows!==T||z.numSpotMaps!==B||z.numLightProbes!==O)&&(s.directional.length=y,s.spot.length=E,s.rectArea.length=S,s.point.length=M,s.hemi.length=v,s.directionalShadow.length=L,s.directionalShadowMap.length=L,s.pointShadow.length=R,s.pointShadowMap.length=R,s.spotShadow.length=T,s.spotShadowMap.length=T,s.directionalShadowMatrix.length=L,s.pointShadowMatrix.length=R,s.spotLightMatrix.length=T+B-I,s.spotLightMap.length=B,s.numSpotLightShadowsWithMaps=I,s.numLightProbes=O,z.directionalLength=y,z.pointLength=M,z.spotLength=E,z.rectAreaLength=S,z.hemiLength=v,z.numDirectionalShadows=L,z.numPointShadows=R,z.numSpotShadows=T,z.numSpotMaps=B,z.numLightProbes=O,s.version=i1++)}function h(d,m){let _=0,g=0,y=0,M=0,E=0;const S=m.matrixWorldInverse;for(let v=0,L=d.length;v<L;v++){const R=d[v];if(R.isDirectionalLight){const T=s.directional[_];T.direction.setFromMatrixPosition(R.matrixWorld),o.setFromMatrixPosition(R.target.matrixWorld),T.direction.sub(o),T.direction.transformDirection(S),_++}else if(R.isSpotLight){const T=s.spot[y];T.position.setFromMatrixPosition(R.matrixWorld),T.position.applyMatrix4(S),T.direction.setFromMatrixPosition(R.matrixWorld),o.setFromMatrixPosition(R.target.matrixWorld),T.direction.sub(o),T.direction.transformDirection(S),y++}else if(R.isRectAreaLight){const T=s.rectArea[M];T.position.setFromMatrixPosition(R.matrixWorld),T.position.applyMatrix4(S),c.identity(),l.copy(R.matrixWorld),l.premultiply(S),c.extractRotation(l),T.halfWidth.set(R.width*.5,0,0),T.halfHeight.set(0,R.height*.5,0),T.halfWidth.applyMatrix4(c),T.halfHeight.applyMatrix4(c),M++}else if(R.isPointLight){const T=s.point[g];T.position.setFromMatrixPosition(R.matrixWorld),T.position.applyMatrix4(S),g++}else if(R.isHemisphereLight){const T=s.hemi[E];T.direction.setFromMatrixPosition(R.matrixWorld),T.direction.transformDirection(S),E++}}}return{setup:f,setupView:h,state:s}}function zg(i){const e=new s1(i),t=[],s=[];function o(m){d.camera=m,t.length=0,s.length=0}function l(m){t.push(m)}function c(m){s.push(m)}function f(){e.setup(t)}function h(m){e.setupView(t,m)}const d={lightsArray:t,shadowsArray:s,camera:null,lights:e,transmissionRenderTarget:{}};return{init:o,state:d,setupLights:f,setupLightsView:h,pushLight:l,pushShadow:c}}function o1(i){let e=new WeakMap;function t(o,l=0){const c=e.get(o);let f;return c===void 0?(f=new zg(i),e.set(o,[f])):l>=c.length?(f=new zg(i),c.push(f)):f=c[l],f}function s(){e=new WeakMap}return{get:t,dispose:s}}class a1 extends Ca{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Hx,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class l1 extends Ca{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const c1=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,u1=`uniform sampler2D shadow_pass;
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
}`;function f1(i,e,t){let s=new td;const o=new ze,l=new ze,c=new Xt,f=new a1({depthPacking:Vx}),h=new l1,d={},m=t.maxTextureSize,_={[Gr]:Dn,[Dn]:Gr,[ci]:ci},g=new Wr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ze},radius:{value:4}},vertexShader:c1,fragmentShader:u1}),y=g.clone();y.defines.HORIZONTAL_PASS=1;const M=new zi;M.setAttribute("position",new Ti(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const E=new Nt(M,g),S=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=v0;let v=this.type;this.render=function(I,O,z){if(S.enabled===!1||S.autoUpdate===!1&&S.needsUpdate===!1||I.length===0)return;const P=i.getRenderTarget(),A=i.getActiveCubeFace(),U=i.getActiveMipmapLevel(),Q=i.state;Q.setBlending(Hr),Q.buffers.color.setClear(1,1,1,1),Q.buffers.depth.setTest(!0),Q.setScissorTest(!1);const Y=v!==rr&&this.type===rr,ie=v===rr&&this.type!==rr;for(let le=0,se=I.length;le<se;le++){const ce=I[le],V=ce.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",ce,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;o.copy(V.mapSize);const ue=V.getFrameExtents();if(o.multiply(ue),l.copy(V.mapSize),(o.x>m||o.y>m)&&(o.x>m&&(l.x=Math.floor(m/ue.x),o.x=l.x*ue.x,V.mapSize.x=l.x),o.y>m&&(l.y=Math.floor(m/ue.y),o.y=l.y*ue.y,V.mapSize.y=l.y)),V.map===null||Y===!0||ie===!0){const k=this.type!==rr?{minFilter:wi,magFilter:wi}:{};V.map!==null&&V.map.dispose(),V.map=new _s(o.x,o.y,k),V.map.texture.name=ce.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const oe=V.getViewportCount();for(let k=0;k<oe;k++){const ee=V.getViewport(k);c.set(l.x*ee.x,l.y*ee.y,l.x*ee.z,l.y*ee.w),Q.viewport(c),V.updateMatrices(ce,k),s=V.getFrustum(),T(O,z,V.camera,ce,this.type)}V.isPointLightShadow!==!0&&this.type===rr&&L(V,z),V.needsUpdate=!1}v=this.type,S.needsUpdate=!1,i.setRenderTarget(P,A,U)};function L(I,O){const z=e.update(E);g.defines.VSM_SAMPLES!==I.blurSamples&&(g.defines.VSM_SAMPLES=I.blurSamples,y.defines.VSM_SAMPLES=I.blurSamples,g.needsUpdate=!0,y.needsUpdate=!0),I.mapPass===null&&(I.mapPass=new _s(o.x,o.y)),g.uniforms.shadow_pass.value=I.map.texture,g.uniforms.resolution.value=I.mapSize,g.uniforms.radius.value=I.radius,i.setRenderTarget(I.mapPass),i.clear(),i.renderBufferDirect(O,null,z,g,E,null),y.uniforms.shadow_pass.value=I.mapPass.texture,y.uniforms.resolution.value=I.mapSize,y.uniforms.radius.value=I.radius,i.setRenderTarget(I.map),i.clear(),i.renderBufferDirect(O,null,z,y,E,null)}function R(I,O,z,P){let A=null;const U=z.isPointLight===!0?I.customDistanceMaterial:I.customDepthMaterial;if(U!==void 0)A=U;else if(A=z.isPointLight===!0?h:f,i.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0){const Q=A.uuid,Y=O.uuid;let ie=d[Q];ie===void 0&&(ie={},d[Q]=ie);let le=ie[Y];le===void 0&&(le=A.clone(),ie[Y]=le,O.addEventListener("dispose",B)),A=le}if(A.visible=O.visible,A.wireframe=O.wireframe,P===rr?A.side=O.shadowSide!==null?O.shadowSide:O.side:A.side=O.shadowSide!==null?O.shadowSide:_[O.side],A.alphaMap=O.alphaMap,A.alphaTest=O.alphaTest,A.map=O.map,A.clipShadows=O.clipShadows,A.clippingPlanes=O.clippingPlanes,A.clipIntersection=O.clipIntersection,A.displacementMap=O.displacementMap,A.displacementScale=O.displacementScale,A.displacementBias=O.displacementBias,A.wireframeLinewidth=O.wireframeLinewidth,A.linewidth=O.linewidth,z.isPointLight===!0&&A.isMeshDistanceMaterial===!0){const Q=i.properties.get(A);Q.light=z}return A}function T(I,O,z,P,A){if(I.visible===!1)return;if(I.layers.test(O.layers)&&(I.isMesh||I.isLine||I.isPoints)&&(I.castShadow||I.receiveShadow&&A===rr)&&(!I.frustumCulled||s.intersectsObject(I))){I.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,I.matrixWorld);const Y=e.update(I),ie=I.material;if(Array.isArray(ie)){const le=Y.groups;for(let se=0,ce=le.length;se<ce;se++){const V=le[se],ue=ie[V.materialIndex];if(ue&&ue.visible){const oe=R(I,ue,P,A);I.onBeforeShadow(i,I,O,z,Y,oe,V),i.renderBufferDirect(z,null,Y,oe,I,V),I.onAfterShadow(i,I,O,z,Y,oe,V)}}}else if(ie.visible){const le=R(I,ie,P,A);I.onBeforeShadow(i,I,O,z,Y,le,null),i.renderBufferDirect(z,null,Y,le,I,null),I.onAfterShadow(i,I,O,z,Y,le,null)}}const Q=I.children;for(let Y=0,ie=Q.length;Y<ie;Y++)T(Q[Y],O,z,P,A)}function B(I){I.target.removeEventListener("dispose",B);for(const z in d){const P=d[z],A=I.target.uuid;A in P&&(P[A].dispose(),delete P[A])}}}const h1={[Qf]:Jf,[eh]:ih,[th]:rh,[go]:nh,[Jf]:Qf,[ih]:eh,[rh]:th,[nh]:go};function d1(i,e){function t(){let X=!1;const Ne=new Xt;let ae=null;const ge=new Xt(0,0,0,0);return{setMask:function(ke){ae!==ke&&!X&&(i.colorMask(ke,ke,ke,ke),ae=ke)},setLocked:function(ke){X=ke},setClear:function(ke,Ue,ht,Ft,$t){$t===!0&&(ke*=Ft,Ue*=Ft,ht*=Ft),Ne.set(ke,Ue,ht,Ft),ge.equals(Ne)===!1&&(i.clearColor(ke,Ue,ht,Ft),ge.copy(Ne))},reset:function(){X=!1,ae=null,ge.set(-1,0,0,0)}}}function s(){let X=!1,Ne=!1,ae=null,ge=null,ke=null;return{setReversed:function(Ue){if(Ne!==Ue){const ht=e.get("EXT_clip_control");Ne?ht.clipControlEXT(ht.LOWER_LEFT_EXT,ht.ZERO_TO_ONE_EXT):ht.clipControlEXT(ht.LOWER_LEFT_EXT,ht.NEGATIVE_ONE_TO_ONE_EXT);const Ft=ke;ke=null,this.setClear(Ft)}Ne=Ue},getReversed:function(){return Ne},setTest:function(Ue){Ue?de(i.DEPTH_TEST):Pe(i.DEPTH_TEST)},setMask:function(Ue){ae!==Ue&&!X&&(i.depthMask(Ue),ae=Ue)},setFunc:function(Ue){if(Ne&&(Ue=h1[Ue]),ge!==Ue){switch(Ue){case Qf:i.depthFunc(i.NEVER);break;case Jf:i.depthFunc(i.ALWAYS);break;case eh:i.depthFunc(i.LESS);break;case go:i.depthFunc(i.LEQUAL);break;case th:i.depthFunc(i.EQUAL);break;case nh:i.depthFunc(i.GEQUAL);break;case ih:i.depthFunc(i.GREATER);break;case rh:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=Ue}},setLocked:function(Ue){X=Ue},setClear:function(Ue){ke!==Ue&&(Ne&&(Ue=1-Ue),i.clearDepth(Ue),ke=Ue)},reset:function(){X=!1,ae=null,ge=null,ke=null,Ne=!1}}}function o(){let X=!1,Ne=null,ae=null,ge=null,ke=null,Ue=null,ht=null,Ft=null,$t=null;return{setTest:function(Et){X||(Et?de(i.STENCIL_TEST):Pe(i.STENCIL_TEST))},setMask:function(Et){Ne!==Et&&!X&&(i.stencilMask(Et),Ne=Et)},setFunc:function(Et,Un,En){(ae!==Et||ge!==Un||ke!==En)&&(i.stencilFunc(Et,Un,En),ae=Et,ge=Un,ke=En)},setOp:function(Et,Un,En){(Ue!==Et||ht!==Un||Ft!==En)&&(i.stencilOp(Et,Un,En),Ue=Et,ht=Un,Ft=En)},setLocked:function(Et){X=Et},setClear:function(Et){$t!==Et&&(i.clearStencil(Et),$t=Et)},reset:function(){X=!1,Ne=null,ae=null,ge=null,ke=null,Ue=null,ht=null,Ft=null,$t=null}}}const l=new t,c=new s,f=new o,h=new WeakMap,d=new WeakMap;let m={},_={},g=new WeakMap,y=[],M=null,E=!1,S=null,v=null,L=null,R=null,T=null,B=null,I=null,O=new Mt(0,0,0),z=0,P=!1,A=null,U=null,Q=null,Y=null,ie=null;const le=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let se=!1,ce=0;const V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(ce=parseFloat(/^WebGL (\d)/.exec(V)[1]),se=ce>=1):V.indexOf("OpenGL ES")!==-1&&(ce=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),se=ce>=2);let ue=null,oe={};const k=i.getParameter(i.SCISSOR_BOX),ee=i.getParameter(i.VIEWPORT),Fe=new Xt().fromArray(k),J=new Xt().fromArray(ee);function he(X,Ne,ae,ge){const ke=new Uint8Array(4),Ue=i.createTexture();i.bindTexture(X,Ue),i.texParameteri(X,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(X,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ht=0;ht<ae;ht++)X===i.TEXTURE_3D||X===i.TEXTURE_2D_ARRAY?i.texImage3D(Ne,0,i.RGBA,1,1,ge,0,i.RGBA,i.UNSIGNED_BYTE,ke):i.texImage2D(Ne+ht,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ke);return Ue}const Me={};Me[i.TEXTURE_2D]=he(i.TEXTURE_2D,i.TEXTURE_2D,1),Me[i.TEXTURE_CUBE_MAP]=he(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Me[i.TEXTURE_2D_ARRAY]=he(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Me[i.TEXTURE_3D]=he(i.TEXTURE_3D,i.TEXTURE_3D,1,1),l.setClear(0,0,0,1),c.setClear(1),f.setClear(0),de(i.DEPTH_TEST),c.setFunc(go),Ee(!1),Ve(Gm),de(i.CULL_FACE),F(Hr);function de(X){m[X]!==!0&&(i.enable(X),m[X]=!0)}function Pe(X){m[X]!==!1&&(i.disable(X),m[X]=!1)}function He(X,Ne){return _[X]!==Ne?(i.bindFramebuffer(X,Ne),_[X]=Ne,X===i.DRAW_FRAMEBUFFER&&(_[i.FRAMEBUFFER]=Ne),X===i.FRAMEBUFFER&&(_[i.DRAW_FRAMEBUFFER]=Ne),!0):!1}function Ze(X,Ne){let ae=y,ge=!1;if(X){ae=g.get(Ne),ae===void 0&&(ae=[],g.set(Ne,ae));const ke=X.textures;if(ae.length!==ke.length||ae[0]!==i.COLOR_ATTACHMENT0){for(let Ue=0,ht=ke.length;Ue<ht;Ue++)ae[Ue]=i.COLOR_ATTACHMENT0+Ue;ae.length=ke.length,ge=!0}}else ae[0]!==i.BACK&&(ae[0]=i.BACK,ge=!0);ge&&i.drawBuffers(ae)}function vt(X){return M!==X?(i.useProgram(X),M=X,!0):!1}const ve={[ds]:i.FUNC_ADD,[px]:i.FUNC_SUBTRACT,[mx]:i.FUNC_REVERSE_SUBTRACT};ve[gx]=i.MIN,ve[vx]=i.MAX;const Ae={[_x]:i.ZERO,[xx]:i.ONE,[yx]:i.SRC_COLOR,[$f]:i.SRC_ALPHA,[Ax]:i.SRC_ALPHA_SATURATE,[wx]:i.DST_COLOR,[Mx]:i.DST_ALPHA,[Sx]:i.ONE_MINUS_SRC_COLOR,[Zf]:i.ONE_MINUS_SRC_ALPHA,[Tx]:i.ONE_MINUS_DST_COLOR,[Ex]:i.ONE_MINUS_DST_ALPHA,[Cx]:i.CONSTANT_COLOR,[Rx]:i.ONE_MINUS_CONSTANT_COLOR,[Px]:i.CONSTANT_ALPHA,[bx]:i.ONE_MINUS_CONSTANT_ALPHA};function F(X,Ne,ae,ge,ke,Ue,ht,Ft,$t,Et){if(X===Hr){E===!0&&(Pe(i.BLEND),E=!1);return}if(E===!1&&(de(i.BLEND),E=!0),X!==dx){if(X!==S||Et!==P){if((v!==ds||T!==ds)&&(i.blendEquation(i.FUNC_ADD),v=ds,T=ds),Et)switch(X){case fo:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Kf:i.blendFunc(i.ONE,i.ONE);break;case Wm:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Xm:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",X);break}else switch(X){case fo:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Kf:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Wm:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Xm:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",X);break}L=null,R=null,B=null,I=null,O.set(0,0,0),z=0,S=X,P=Et}return}ke=ke||Ne,Ue=Ue||ae,ht=ht||ge,(Ne!==v||ke!==T)&&(i.blendEquationSeparate(ve[Ne],ve[ke]),v=Ne,T=ke),(ae!==L||ge!==R||Ue!==B||ht!==I)&&(i.blendFuncSeparate(Ae[ae],Ae[ge],Ae[Ue],Ae[ht]),L=ae,R=ge,B=Ue,I=ht),(Ft.equals(O)===!1||$t!==z)&&(i.blendColor(Ft.r,Ft.g,Ft.b,$t),O.copy(Ft),z=$t),S=X,P=!1}function Qe(X,Ne){X.side===ci?Pe(i.CULL_FACE):de(i.CULL_FACE);let ae=X.side===Dn;Ne&&(ae=!ae),Ee(ae),X.blending===fo&&X.transparent===!1?F(Hr):F(X.blending,X.blendEquation,X.blendSrc,X.blendDst,X.blendEquationAlpha,X.blendSrcAlpha,X.blendDstAlpha,X.blendColor,X.blendAlpha,X.premultipliedAlpha),c.setFunc(X.depthFunc),c.setTest(X.depthTest),c.setMask(X.depthWrite),l.setMask(X.colorWrite);const ge=X.stencilWrite;f.setTest(ge),ge&&(f.setMask(X.stencilWriteMask),f.setFunc(X.stencilFunc,X.stencilRef,X.stencilFuncMask),f.setOp(X.stencilFail,X.stencilZFail,X.stencilZPass)),it(X.polygonOffset,X.polygonOffsetFactor,X.polygonOffsetUnits),X.alphaToCoverage===!0?de(i.SAMPLE_ALPHA_TO_COVERAGE):Pe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ee(X){A!==X&&(X?i.frontFace(i.CW):i.frontFace(i.CCW),A=X)}function Ve(X){X!==fx?(de(i.CULL_FACE),X!==U&&(X===Gm?i.cullFace(i.BACK):X===hx?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Pe(i.CULL_FACE),U=X}function be(X){X!==Q&&(se&&i.lineWidth(X),Q=X)}function it(X,Ne,ae){X?(de(i.POLYGON_OFFSET_FILL),(Y!==Ne||ie!==ae)&&(i.polygonOffset(Ne,ae),Y=Ne,ie=ae)):Pe(i.POLYGON_OFFSET_FILL)}function Oe(X){X?de(i.SCISSOR_TEST):Pe(i.SCISSOR_TEST)}function D(X){X===void 0&&(X=i.TEXTURE0+le-1),ue!==X&&(i.activeTexture(X),ue=X)}function C(X,Ne,ae){ae===void 0&&(ue===null?ae=i.TEXTURE0+le-1:ae=ue);let ge=oe[ae];ge===void 0&&(ge={type:void 0,texture:void 0},oe[ae]=ge),(ge.type!==X||ge.texture!==Ne)&&(ue!==ae&&(i.activeTexture(ae),ue=ae),i.bindTexture(X,Ne||Me[X]),ge.type=X,ge.texture=Ne)}function $(){const X=oe[ue];X!==void 0&&X.type!==void 0&&(i.bindTexture(X.type,null),X.type=void 0,X.texture=void 0)}function pe(){try{i.compressedTexImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function _e(){try{i.compressedTexImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function me(){try{i.texSubImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function Ye(){try{i.texSubImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function De(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function Ge(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function dt(){try{i.texStorage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function we(){try{i.texStorage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function Xe(){try{i.texImage2D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function ot(){try{i.texImage3D.apply(i,arguments)}catch(X){console.error("THREE.WebGLState:",X)}}function at(X){Fe.equals(X)===!1&&(i.scissor(X.x,X.y,X.z,X.w),Fe.copy(X))}function je(X){J.equals(X)===!1&&(i.viewport(X.x,X.y,X.z,X.w),J.copy(X))}function _t(X,Ne){let ae=d.get(Ne);ae===void 0&&(ae=new WeakMap,d.set(Ne,ae));let ge=ae.get(X);ge===void 0&&(ge=i.getUniformBlockIndex(Ne,X.name),ae.set(X,ge))}function ft(X,Ne){const ge=d.get(Ne).get(X);h.get(Ne)!==ge&&(i.uniformBlockBinding(Ne,ge,X.__bindingPointIndex),h.set(Ne,ge))}function bt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),c.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),m={},ue=null,oe={},_={},g=new WeakMap,y=[],M=null,E=!1,S=null,v=null,L=null,R=null,T=null,B=null,I=null,O=new Mt(0,0,0),z=0,P=!1,A=null,U=null,Q=null,Y=null,ie=null,Fe.set(0,0,i.canvas.width,i.canvas.height),J.set(0,0,i.canvas.width,i.canvas.height),l.reset(),c.reset(),f.reset()}return{buffers:{color:l,depth:c,stencil:f},enable:de,disable:Pe,bindFramebuffer:He,drawBuffers:Ze,useProgram:vt,setBlending:F,setMaterial:Qe,setFlipSided:Ee,setCullFace:Ve,setLineWidth:be,setPolygonOffset:it,setScissorTest:Oe,activeTexture:D,bindTexture:C,unbindTexture:$,compressedTexImage2D:pe,compressedTexImage3D:_e,texImage2D:Xe,texImage3D:ot,updateUBOMapping:_t,uniformBlockBinding:ft,texStorage2D:dt,texStorage3D:we,texSubImage2D:me,texSubImage3D:Ye,compressedTexSubImage2D:De,compressedTexSubImage3D:Ge,scissor:at,viewport:je,reset:bt}}function Bg(i,e,t,s){const o=p1(s);switch(t){case w0:return i*e;case A0:return i*e;case C0:return i*e*2;case R0:return i*e/o.components*o.byteLength;case $h:return i*e/o.components*o.byteLength;case P0:return i*e*2/o.components*o.byteLength;case Zh:return i*e*2/o.components*o.byteLength;case T0:return i*e*3/o.components*o.byteLength;case Mi:return i*e*4/o.components*o.byteLength;case Qh:return i*e*4/o.components*o.byteLength;case cc:case uc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case fc:case hc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ch:case fh:return Math.max(i,16)*Math.max(e,8)/4;case lh:case uh:return Math.max(i,8)*Math.max(e,8)/2;case hh:case dh:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ph:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case mh:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case gh:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case vh:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case _h:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case xh:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case yh:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Sh:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Mh:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Eh:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case wh:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Th:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ah:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ch:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Rh:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case dc:case Ph:case bh:return Math.ceil(i/4)*Math.ceil(e/4)*16;case b0:case Lh:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Dh:case Nh:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function p1(i){switch(i){case ur:case S0:return{byteLength:1,components:1};case ya:case M0:case Ta:return{byteLength:2,components:1};case Yh:case Kh:return{byteLength:2,components:4};case vs:case qh:case or:return{byteLength:4,components:1};case E0:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function m1(i,e,t,s,o,l,c){const f=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),d=new ze,m=new WeakMap;let _;const g=new WeakMap;let y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(D,C){return y?new OffscreenCanvas(D,C):gc("canvas")}function E(D,C,$){let pe=1;const _e=Oe(D);if((_e.width>$||_e.height>$)&&(pe=$/Math.max(_e.width,_e.height)),pe<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const me=Math.floor(pe*_e.width),Ye=Math.floor(pe*_e.height);_===void 0&&(_=M(me,Ye));const De=C?M(me,Ye):_;return De.width=me,De.height=Ye,De.getContext("2d").drawImage(D,0,0,me,Ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+_e.width+"x"+_e.height+") to ("+me+"x"+Ye+")."),De}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+_e.width+"x"+_e.height+")."),D;return D}function S(D){return D.generateMipmaps}function v(D){i.generateMipmap(D)}function L(D){return D.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?i.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function R(D,C,$,pe,_e=!1){if(D!==null){if(i[D]!==void 0)return i[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let me=C;if(C===i.RED&&($===i.FLOAT&&(me=i.R32F),$===i.HALF_FLOAT&&(me=i.R16F),$===i.UNSIGNED_BYTE&&(me=i.R8)),C===i.RED_INTEGER&&($===i.UNSIGNED_BYTE&&(me=i.R8UI),$===i.UNSIGNED_SHORT&&(me=i.R16UI),$===i.UNSIGNED_INT&&(me=i.R32UI),$===i.BYTE&&(me=i.R8I),$===i.SHORT&&(me=i.R16I),$===i.INT&&(me=i.R32I)),C===i.RG&&($===i.FLOAT&&(me=i.RG32F),$===i.HALF_FLOAT&&(me=i.RG16F),$===i.UNSIGNED_BYTE&&(me=i.RG8)),C===i.RG_INTEGER&&($===i.UNSIGNED_BYTE&&(me=i.RG8UI),$===i.UNSIGNED_SHORT&&(me=i.RG16UI),$===i.UNSIGNED_INT&&(me=i.RG32UI),$===i.BYTE&&(me=i.RG8I),$===i.SHORT&&(me=i.RG16I),$===i.INT&&(me=i.RG32I)),C===i.RGB_INTEGER&&($===i.UNSIGNED_BYTE&&(me=i.RGB8UI),$===i.UNSIGNED_SHORT&&(me=i.RGB16UI),$===i.UNSIGNED_INT&&(me=i.RGB32UI),$===i.BYTE&&(me=i.RGB8I),$===i.SHORT&&(me=i.RGB16I),$===i.INT&&(me=i.RGB32I)),C===i.RGBA_INTEGER&&($===i.UNSIGNED_BYTE&&(me=i.RGBA8UI),$===i.UNSIGNED_SHORT&&(me=i.RGBA16UI),$===i.UNSIGNED_INT&&(me=i.RGBA32UI),$===i.BYTE&&(me=i.RGBA8I),$===i.SHORT&&(me=i.RGBA16I),$===i.INT&&(me=i.RGBA32I)),C===i.RGB&&$===i.UNSIGNED_INT_5_9_9_9_REV&&(me=i.RGB9_E5),C===i.RGBA){const Ye=_e?_c:At.getTransfer(pe);$===i.FLOAT&&(me=i.RGBA32F),$===i.HALF_FLOAT&&(me=i.RGBA16F),$===i.UNSIGNED_BYTE&&(me=Ye===Dt?i.SRGB8_ALPHA8:i.RGBA8),$===i.UNSIGNED_SHORT_4_4_4_4&&(me=i.RGBA4),$===i.UNSIGNED_SHORT_5_5_5_1&&(me=i.RGB5_A1)}return(me===i.R16F||me===i.R32F||me===i.RG16F||me===i.RG32F||me===i.RGBA16F||me===i.RGBA32F)&&e.get("EXT_color_buffer_float"),me}function T(D,C){let $;return D?C===null||C===vs||C===xo?$=i.DEPTH24_STENCIL8:C===or?$=i.DEPTH32F_STENCIL8:C===ya&&($=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):C===null||C===vs||C===xo?$=i.DEPTH_COMPONENT24:C===or?$=i.DEPTH_COMPONENT32F:C===ya&&($=i.DEPTH_COMPONENT16),$}function B(D,C){return S(D)===!0||D.isFramebufferTexture&&D.minFilter!==wi&&D.minFilter!==Oi?Math.log2(Math.max(C.width,C.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?C.mipmaps.length:1}function I(D){const C=D.target;C.removeEventListener("dispose",I),z(C),C.isVideoTexture&&m.delete(C)}function O(D){const C=D.target;C.removeEventListener("dispose",O),A(C)}function z(D){const C=s.get(D);if(C.__webglInit===void 0)return;const $=D.source,pe=g.get($);if(pe){const _e=pe[C.__cacheKey];_e.usedTimes--,_e.usedTimes===0&&P(D),Object.keys(pe).length===0&&g.delete($)}s.remove(D)}function P(D){const C=s.get(D);i.deleteTexture(C.__webglTexture);const $=D.source,pe=g.get($);delete pe[C.__cacheKey],c.memory.textures--}function A(D){const C=s.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),s.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let pe=0;pe<6;pe++){if(Array.isArray(C.__webglFramebuffer[pe]))for(let _e=0;_e<C.__webglFramebuffer[pe].length;_e++)i.deleteFramebuffer(C.__webglFramebuffer[pe][_e]);else i.deleteFramebuffer(C.__webglFramebuffer[pe]);C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer[pe])}else{if(Array.isArray(C.__webglFramebuffer))for(let pe=0;pe<C.__webglFramebuffer.length;pe++)i.deleteFramebuffer(C.__webglFramebuffer[pe]);else i.deleteFramebuffer(C.__webglFramebuffer);if(C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer),C.__webglMultisampledFramebuffer&&i.deleteFramebuffer(C.__webglMultisampledFramebuffer),C.__webglColorRenderbuffer)for(let pe=0;pe<C.__webglColorRenderbuffer.length;pe++)C.__webglColorRenderbuffer[pe]&&i.deleteRenderbuffer(C.__webglColorRenderbuffer[pe]);C.__webglDepthRenderbuffer&&i.deleteRenderbuffer(C.__webglDepthRenderbuffer)}const $=D.textures;for(let pe=0,_e=$.length;pe<_e;pe++){const me=s.get($[pe]);me.__webglTexture&&(i.deleteTexture(me.__webglTexture),c.memory.textures--),s.remove($[pe])}s.remove(D)}let U=0;function Q(){U=0}function Y(){const D=U;return D>=o.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+o.maxTextures),U+=1,D}function ie(D){const C=[];return C.push(D.wrapS),C.push(D.wrapT),C.push(D.wrapR||0),C.push(D.magFilter),C.push(D.minFilter),C.push(D.anisotropy),C.push(D.internalFormat),C.push(D.format),C.push(D.type),C.push(D.generateMipmaps),C.push(D.premultiplyAlpha),C.push(D.flipY),C.push(D.unpackAlignment),C.push(D.colorSpace),C.join()}function le(D,C){const $=s.get(D);if(D.isVideoTexture&&be(D),D.isRenderTargetTexture===!1&&D.version>0&&$.__version!==D.version){const pe=D.image;if(pe===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(pe.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J($,D,C);return}}t.bindTexture(i.TEXTURE_2D,$.__webglTexture,i.TEXTURE0+C)}function se(D,C){const $=s.get(D);if(D.version>0&&$.__version!==D.version){J($,D,C);return}t.bindTexture(i.TEXTURE_2D_ARRAY,$.__webglTexture,i.TEXTURE0+C)}function ce(D,C){const $=s.get(D);if(D.version>0&&$.__version!==D.version){J($,D,C);return}t.bindTexture(i.TEXTURE_3D,$.__webglTexture,i.TEXTURE0+C)}function V(D,C){const $=s.get(D);if(D.version>0&&$.__version!==D.version){he($,D,C);return}t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture,i.TEXTURE0+C)}const ue={[xa]:i.REPEAT,[ms]:i.CLAMP_TO_EDGE,[ah]:i.MIRRORED_REPEAT},oe={[wi]:i.NEAREST,[Bx]:i.NEAREST_MIPMAP_NEAREST,[Ul]:i.NEAREST_MIPMAP_LINEAR,[Oi]:i.LINEAR,[lf]:i.LINEAR_MIPMAP_NEAREST,[gs]:i.LINEAR_MIPMAP_LINEAR},k={[Wx]:i.NEVER,[$x]:i.ALWAYS,[Xx]:i.LESS,[D0]:i.LEQUAL,[jx]:i.EQUAL,[Kx]:i.GEQUAL,[qx]:i.GREATER,[Yx]:i.NOTEQUAL};function ee(D,C){if(C.type===or&&e.has("OES_texture_float_linear")===!1&&(C.magFilter===Oi||C.magFilter===lf||C.magFilter===Ul||C.magFilter===gs||C.minFilter===Oi||C.minFilter===lf||C.minFilter===Ul||C.minFilter===gs)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(D,i.TEXTURE_WRAP_S,ue[C.wrapS]),i.texParameteri(D,i.TEXTURE_WRAP_T,ue[C.wrapT]),(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)&&i.texParameteri(D,i.TEXTURE_WRAP_R,ue[C.wrapR]),i.texParameteri(D,i.TEXTURE_MAG_FILTER,oe[C.magFilter]),i.texParameteri(D,i.TEXTURE_MIN_FILTER,oe[C.minFilter]),C.compareFunction&&(i.texParameteri(D,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(D,i.TEXTURE_COMPARE_FUNC,k[C.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(C.magFilter===wi||C.minFilter!==Ul&&C.minFilter!==gs||C.type===or&&e.has("OES_texture_float_linear")===!1)return;if(C.anisotropy>1||s.get(C).__currentAnisotropy){const $=e.get("EXT_texture_filter_anisotropic");i.texParameterf(D,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(C.anisotropy,o.getMaxAnisotropy())),s.get(C).__currentAnisotropy=C.anisotropy}}}function Fe(D,C){let $=!1;D.__webglInit===void 0&&(D.__webglInit=!0,C.addEventListener("dispose",I));const pe=C.source;let _e=g.get(pe);_e===void 0&&(_e={},g.set(pe,_e));const me=ie(C);if(me!==D.__cacheKey){_e[me]===void 0&&(_e[me]={texture:i.createTexture(),usedTimes:0},c.memory.textures++,$=!0),_e[me].usedTimes++;const Ye=_e[D.__cacheKey];Ye!==void 0&&(_e[D.__cacheKey].usedTimes--,Ye.usedTimes===0&&P(C)),D.__cacheKey=me,D.__webglTexture=_e[me].texture}return $}function J(D,C,$){let pe=i.TEXTURE_2D;(C.isDataArrayTexture||C.isCompressedArrayTexture)&&(pe=i.TEXTURE_2D_ARRAY),C.isData3DTexture&&(pe=i.TEXTURE_3D);const _e=Fe(D,C),me=C.source;t.bindTexture(pe,D.__webglTexture,i.TEXTURE0+$);const Ye=s.get(me);if(me.version!==Ye.__version||_e===!0){t.activeTexture(i.TEXTURE0+$);const De=At.getPrimaries(At.workingColorSpace),Ge=C.colorSpace===zr?null:At.getPrimaries(C.colorSpace),dt=C.colorSpace===zr||De===Ge?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,dt);let we=E(C.image,!1,o.maxTextureSize);we=it(C,we);const Xe=l.convert(C.format,C.colorSpace),ot=l.convert(C.type);let at=R(C.internalFormat,Xe,ot,C.colorSpace,C.isVideoTexture);ee(pe,C);let je;const _t=C.mipmaps,ft=C.isVideoTexture!==!0,bt=Ye.__version===void 0||_e===!0,X=me.dataReady,Ne=B(C,we);if(C.isDepthTexture)at=T(C.format===yo,C.type),bt&&(ft?t.texStorage2D(i.TEXTURE_2D,1,at,we.width,we.height):t.texImage2D(i.TEXTURE_2D,0,at,we.width,we.height,0,Xe,ot,null));else if(C.isDataTexture)if(_t.length>0){ft&&bt&&t.texStorage2D(i.TEXTURE_2D,Ne,at,_t[0].width,_t[0].height);for(let ae=0,ge=_t.length;ae<ge;ae++)je=_t[ae],ft?X&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,je.width,je.height,Xe,ot,je.data):t.texImage2D(i.TEXTURE_2D,ae,at,je.width,je.height,0,Xe,ot,je.data);C.generateMipmaps=!1}else ft?(bt&&t.texStorage2D(i.TEXTURE_2D,Ne,at,we.width,we.height),X&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,we.width,we.height,Xe,ot,we.data)):t.texImage2D(i.TEXTURE_2D,0,at,we.width,we.height,0,Xe,ot,we.data);else if(C.isCompressedTexture)if(C.isCompressedArrayTexture){ft&&bt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ne,at,_t[0].width,_t[0].height,we.depth);for(let ae=0,ge=_t.length;ae<ge;ae++)if(je=_t[ae],C.format!==Mi)if(Xe!==null)if(ft){if(X)if(C.layerUpdates.size>0){const ke=Bg(je.width,je.height,C.format,C.type);for(const Ue of C.layerUpdates){const ht=je.data.subarray(Ue*ke/je.data.BYTES_PER_ELEMENT,(Ue+1)*ke/je.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,Ue,je.width,je.height,1,Xe,ht)}C.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,je.width,je.height,we.depth,Xe,je.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,at,je.width,je.height,we.depth,0,je.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ft?X&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,je.width,je.height,we.depth,Xe,ot,je.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,at,je.width,je.height,we.depth,0,Xe,ot,je.data)}else{ft&&bt&&t.texStorage2D(i.TEXTURE_2D,Ne,at,_t[0].width,_t[0].height);for(let ae=0,ge=_t.length;ae<ge;ae++)je=_t[ae],C.format!==Mi?Xe!==null?ft?X&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,je.width,je.height,Xe,je.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,at,je.width,je.height,0,je.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ft?X&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,je.width,je.height,Xe,ot,je.data):t.texImage2D(i.TEXTURE_2D,ae,at,je.width,je.height,0,Xe,ot,je.data)}else if(C.isDataArrayTexture)if(ft){if(bt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ne,at,we.width,we.height,we.depth),X)if(C.layerUpdates.size>0){const ae=Bg(we.width,we.height,C.format,C.type);for(const ge of C.layerUpdates){const ke=we.data.subarray(ge*ae/we.data.BYTES_PER_ELEMENT,(ge+1)*ae/we.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ge,we.width,we.height,1,Xe,ot,ke)}C.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,we.width,we.height,we.depth,Xe,ot,we.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,at,we.width,we.height,we.depth,0,Xe,ot,we.data);else if(C.isData3DTexture)ft?(bt&&t.texStorage3D(i.TEXTURE_3D,Ne,at,we.width,we.height,we.depth),X&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,we.width,we.height,we.depth,Xe,ot,we.data)):t.texImage3D(i.TEXTURE_3D,0,at,we.width,we.height,we.depth,0,Xe,ot,we.data);else if(C.isFramebufferTexture){if(bt)if(ft)t.texStorage2D(i.TEXTURE_2D,Ne,at,we.width,we.height);else{let ae=we.width,ge=we.height;for(let ke=0;ke<Ne;ke++)t.texImage2D(i.TEXTURE_2D,ke,at,ae,ge,0,Xe,ot,null),ae>>=1,ge>>=1}}else if(_t.length>0){if(ft&&bt){const ae=Oe(_t[0]);t.texStorage2D(i.TEXTURE_2D,Ne,at,ae.width,ae.height)}for(let ae=0,ge=_t.length;ae<ge;ae++)je=_t[ae],ft?X&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Xe,ot,je):t.texImage2D(i.TEXTURE_2D,ae,at,Xe,ot,je);C.generateMipmaps=!1}else if(ft){if(bt){const ae=Oe(we);t.texStorage2D(i.TEXTURE_2D,Ne,at,ae.width,ae.height)}X&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Xe,ot,we)}else t.texImage2D(i.TEXTURE_2D,0,at,Xe,ot,we);S(C)&&v(pe),Ye.__version=me.version,C.onUpdate&&C.onUpdate(C)}D.__version=C.version}function he(D,C,$){if(C.image.length!==6)return;const pe=Fe(D,C),_e=C.source;t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+$);const me=s.get(_e);if(_e.version!==me.__version||pe===!0){t.activeTexture(i.TEXTURE0+$);const Ye=At.getPrimaries(At.workingColorSpace),De=C.colorSpace===zr?null:At.getPrimaries(C.colorSpace),Ge=C.colorSpace===zr||Ye===De?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge);const dt=C.isCompressedTexture||C.image[0].isCompressedTexture,we=C.image[0]&&C.image[0].isDataTexture,Xe=[];for(let ge=0;ge<6;ge++)!dt&&!we?Xe[ge]=E(C.image[ge],!0,o.maxCubemapSize):Xe[ge]=we?C.image[ge].image:C.image[ge],Xe[ge]=it(C,Xe[ge]);const ot=Xe[0],at=l.convert(C.format,C.colorSpace),je=l.convert(C.type),_t=R(C.internalFormat,at,je,C.colorSpace),ft=C.isVideoTexture!==!0,bt=me.__version===void 0||pe===!0,X=_e.dataReady;let Ne=B(C,ot);ee(i.TEXTURE_CUBE_MAP,C);let ae;if(dt){ft&&bt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ne,_t,ot.width,ot.height);for(let ge=0;ge<6;ge++){ae=Xe[ge].mipmaps;for(let ke=0;ke<ae.length;ke++){const Ue=ae[ke];C.format!==Mi?at!==null?ft?X&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke,0,0,Ue.width,Ue.height,at,Ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke,_t,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke,0,0,Ue.width,Ue.height,at,je,Ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke,_t,Ue.width,Ue.height,0,at,je,Ue.data)}}}else{if(ae=C.mipmaps,ft&&bt){ae.length>0&&Ne++;const ge=Oe(Xe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ne,_t,ge.width,ge.height)}for(let ge=0;ge<6;ge++)if(we){ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Xe[ge].width,Xe[ge].height,at,je,Xe[ge].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,_t,Xe[ge].width,Xe[ge].height,0,at,je,Xe[ge].data);for(let ke=0;ke<ae.length;ke++){const ht=ae[ke].image[ge].image;ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke+1,0,0,ht.width,ht.height,at,je,ht.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke+1,_t,ht.width,ht.height,0,at,je,ht.data)}}else{ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,at,je,Xe[ge]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,_t,at,je,Xe[ge]);for(let ke=0;ke<ae.length;ke++){const Ue=ae[ke];ft?X&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke+1,0,0,at,je,Ue.image[ge]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ke+1,_t,at,je,Ue.image[ge])}}}S(C)&&v(i.TEXTURE_CUBE_MAP),me.__version=_e.version,C.onUpdate&&C.onUpdate(C)}D.__version=C.version}function Me(D,C,$,pe,_e,me){const Ye=l.convert($.format,$.colorSpace),De=l.convert($.type),Ge=R($.internalFormat,Ye,De,$.colorSpace),dt=s.get(C),we=s.get($);if(we.__renderTarget=C,!dt.__hasExternalTextures){const Xe=Math.max(1,C.width>>me),ot=Math.max(1,C.height>>me);_e===i.TEXTURE_3D||_e===i.TEXTURE_2D_ARRAY?t.texImage3D(_e,me,Ge,Xe,ot,C.depth,0,Ye,De,null):t.texImage2D(_e,me,Ge,Xe,ot,0,Ye,De,null)}t.bindFramebuffer(i.FRAMEBUFFER,D),Ve(C)?f.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,pe,_e,we.__webglTexture,0,Ee(C)):(_e===i.TEXTURE_2D||_e>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&_e<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,pe,_e,we.__webglTexture,me),t.bindFramebuffer(i.FRAMEBUFFER,null)}function de(D,C,$){if(i.bindRenderbuffer(i.RENDERBUFFER,D),C.depthBuffer){const pe=C.depthTexture,_e=pe&&pe.isDepthTexture?pe.type:null,me=T(C.stencilBuffer,_e),Ye=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,De=Ee(C);Ve(C)?f.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,De,me,C.width,C.height):$?i.renderbufferStorageMultisample(i.RENDERBUFFER,De,me,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,me,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ye,i.RENDERBUFFER,D)}else{const pe=C.textures;for(let _e=0;_e<pe.length;_e++){const me=pe[_e],Ye=l.convert(me.format,me.colorSpace),De=l.convert(me.type),Ge=R(me.internalFormat,Ye,De,me.colorSpace),dt=Ee(C);$&&Ve(C)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,dt,Ge,C.width,C.height):Ve(C)?f.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,dt,Ge,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,Ge,C.width,C.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Pe(D,C){if(C&&C.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,D),!(C.depthTexture&&C.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const pe=s.get(C.depthTexture);pe.__renderTarget=C,(!pe.__webglTexture||C.depthTexture.image.width!==C.width||C.depthTexture.image.height!==C.height)&&(C.depthTexture.image.width=C.width,C.depthTexture.image.height=C.height,C.depthTexture.needsUpdate=!0),le(C.depthTexture,0);const _e=pe.__webglTexture,me=Ee(C);if(C.depthTexture.format===ho)Ve(C)?f.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,_e,0,me):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,_e,0);else if(C.depthTexture.format===yo)Ve(C)?f.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,_e,0,me):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,_e,0);else throw new Error("Unknown depthTexture format")}function He(D){const C=s.get(D),$=D.isWebGLCubeRenderTarget===!0;if(C.__boundDepthTexture!==D.depthTexture){const pe=D.depthTexture;if(C.__depthDisposeCallback&&C.__depthDisposeCallback(),pe){const _e=()=>{delete C.__boundDepthTexture,delete C.__depthDisposeCallback,pe.removeEventListener("dispose",_e)};pe.addEventListener("dispose",_e),C.__depthDisposeCallback=_e}C.__boundDepthTexture=pe}if(D.depthTexture&&!C.__autoAllocateDepthBuffer){if($)throw new Error("target.depthTexture not supported in Cube render targets");Pe(C.__webglFramebuffer,D)}else if($){C.__webglDepthbuffer=[];for(let pe=0;pe<6;pe++)if(t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer[pe]),C.__webglDepthbuffer[pe]===void 0)C.__webglDepthbuffer[pe]=i.createRenderbuffer(),de(C.__webglDepthbuffer[pe],D,!1);else{const _e=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,me=C.__webglDepthbuffer[pe];i.bindRenderbuffer(i.RENDERBUFFER,me),i.framebufferRenderbuffer(i.FRAMEBUFFER,_e,i.RENDERBUFFER,me)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer),C.__webglDepthbuffer===void 0)C.__webglDepthbuffer=i.createRenderbuffer(),de(C.__webglDepthbuffer,D,!1);else{const pe=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_e=C.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,_e),i.framebufferRenderbuffer(i.FRAMEBUFFER,pe,i.RENDERBUFFER,_e)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ze(D,C,$){const pe=s.get(D);C!==void 0&&Me(pe.__webglFramebuffer,D,D.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),$!==void 0&&He(D)}function vt(D){const C=D.texture,$=s.get(D),pe=s.get(C);D.addEventListener("dispose",O);const _e=D.textures,me=D.isWebGLCubeRenderTarget===!0,Ye=_e.length>1;if(Ye||(pe.__webglTexture===void 0&&(pe.__webglTexture=i.createTexture()),pe.__version=C.version,c.memory.textures++),me){$.__webglFramebuffer=[];for(let De=0;De<6;De++)if(C.mipmaps&&C.mipmaps.length>0){$.__webglFramebuffer[De]=[];for(let Ge=0;Ge<C.mipmaps.length;Ge++)$.__webglFramebuffer[De][Ge]=i.createFramebuffer()}else $.__webglFramebuffer[De]=i.createFramebuffer()}else{if(C.mipmaps&&C.mipmaps.length>0){$.__webglFramebuffer=[];for(let De=0;De<C.mipmaps.length;De++)$.__webglFramebuffer[De]=i.createFramebuffer()}else $.__webglFramebuffer=i.createFramebuffer();if(Ye)for(let De=0,Ge=_e.length;De<Ge;De++){const dt=s.get(_e[De]);dt.__webglTexture===void 0&&(dt.__webglTexture=i.createTexture(),c.memory.textures++)}if(D.samples>0&&Ve(D)===!1){$.__webglMultisampledFramebuffer=i.createFramebuffer(),$.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let De=0;De<_e.length;De++){const Ge=_e[De];$.__webglColorRenderbuffer[De]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,$.__webglColorRenderbuffer[De]);const dt=l.convert(Ge.format,Ge.colorSpace),we=l.convert(Ge.type),Xe=R(Ge.internalFormat,dt,we,Ge.colorSpace,D.isXRRenderTarget===!0),ot=Ee(D);i.renderbufferStorageMultisample(i.RENDERBUFFER,ot,Xe,D.width,D.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.RENDERBUFFER,$.__webglColorRenderbuffer[De])}i.bindRenderbuffer(i.RENDERBUFFER,null),D.depthBuffer&&($.__webglDepthRenderbuffer=i.createRenderbuffer(),de($.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(me){t.bindTexture(i.TEXTURE_CUBE_MAP,pe.__webglTexture),ee(i.TEXTURE_CUBE_MAP,C);for(let De=0;De<6;De++)if(C.mipmaps&&C.mipmaps.length>0)for(let Ge=0;Ge<C.mipmaps.length;Ge++)Me($.__webglFramebuffer[De][Ge],D,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ge);else Me($.__webglFramebuffer[De],D,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+De,0);S(C)&&v(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ye){for(let De=0,Ge=_e.length;De<Ge;De++){const dt=_e[De],we=s.get(dt);t.bindTexture(i.TEXTURE_2D,we.__webglTexture),ee(i.TEXTURE_2D,dt),Me($.__webglFramebuffer,D,dt,i.COLOR_ATTACHMENT0+De,i.TEXTURE_2D,0),S(dt)&&v(i.TEXTURE_2D)}t.unbindTexture()}else{let De=i.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(De=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(De,pe.__webglTexture),ee(De,C),C.mipmaps&&C.mipmaps.length>0)for(let Ge=0;Ge<C.mipmaps.length;Ge++)Me($.__webglFramebuffer[Ge],D,C,i.COLOR_ATTACHMENT0,De,Ge);else Me($.__webglFramebuffer,D,C,i.COLOR_ATTACHMENT0,De,0);S(C)&&v(De),t.unbindTexture()}D.depthBuffer&&He(D)}function ve(D){const C=D.textures;for(let $=0,pe=C.length;$<pe;$++){const _e=C[$];if(S(_e)){const me=L(D),Ye=s.get(_e).__webglTexture;t.bindTexture(me,Ye),v(me),t.unbindTexture()}}}const Ae=[],F=[];function Qe(D){if(D.samples>0){if(Ve(D)===!1){const C=D.textures,$=D.width,pe=D.height;let _e=i.COLOR_BUFFER_BIT;const me=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ye=s.get(D),De=C.length>1;if(De)for(let Ge=0;Ge<C.length;Ge++)t.bindFramebuffer(i.FRAMEBUFFER,Ye.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ye.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ye.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ye.__webglFramebuffer);for(let Ge=0;Ge<C.length;Ge++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(_e|=i.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(_e|=i.STENCIL_BUFFER_BIT)),De){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ye.__webglColorRenderbuffer[Ge]);const dt=s.get(C[Ge]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,dt,0)}i.blitFramebuffer(0,0,$,pe,0,0,$,pe,_e,i.NEAREST),h===!0&&(Ae.length=0,F.length=0,Ae.push(i.COLOR_ATTACHMENT0+Ge),D.depthBuffer&&D.resolveDepthBuffer===!1&&(Ae.push(me),F.push(me),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,F)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ae))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),De)for(let Ge=0;Ge<C.length;Ge++){t.bindFramebuffer(i.FRAMEBUFFER,Ye.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.RENDERBUFFER,Ye.__webglColorRenderbuffer[Ge]);const dt=s.get(C[Ge]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ye.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ge,i.TEXTURE_2D,dt,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ye.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&h){const C=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[C])}}}function Ee(D){return Math.min(o.maxSamples,D.samples)}function Ve(D){const C=s.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&C.__useRenderToTexture!==!1}function be(D){const C=c.render.frame;m.get(D)!==C&&(m.set(D,C),D.update())}function it(D,C){const $=D.colorSpace,pe=D.format,_e=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||$!==Eo&&$!==zr&&(At.getTransfer($)===Dt?(pe!==Mi||_e!==ur)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",$)),C}function Oe(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(d.width=D.naturalWidth||D.width,d.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(d.width=D.displayWidth,d.height=D.displayHeight):(d.width=D.width,d.height=D.height),d}this.allocateTextureUnit=Y,this.resetTextureUnits=Q,this.setTexture2D=le,this.setTexture2DArray=se,this.setTexture3D=ce,this.setTextureCube=V,this.rebindTextures=Ze,this.setupRenderTarget=vt,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=Qe,this.setupDepthRenderbuffer=He,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=Ve}function g1(i,e){function t(s,o=zr){let l;const c=At.getTransfer(o);if(s===ur)return i.UNSIGNED_BYTE;if(s===Yh)return i.UNSIGNED_SHORT_4_4_4_4;if(s===Kh)return i.UNSIGNED_SHORT_5_5_5_1;if(s===E0)return i.UNSIGNED_INT_5_9_9_9_REV;if(s===S0)return i.BYTE;if(s===M0)return i.SHORT;if(s===ya)return i.UNSIGNED_SHORT;if(s===qh)return i.INT;if(s===vs)return i.UNSIGNED_INT;if(s===or)return i.FLOAT;if(s===Ta)return i.HALF_FLOAT;if(s===w0)return i.ALPHA;if(s===T0)return i.RGB;if(s===Mi)return i.RGBA;if(s===A0)return i.LUMINANCE;if(s===C0)return i.LUMINANCE_ALPHA;if(s===ho)return i.DEPTH_COMPONENT;if(s===yo)return i.DEPTH_STENCIL;if(s===R0)return i.RED;if(s===$h)return i.RED_INTEGER;if(s===P0)return i.RG;if(s===Zh)return i.RG_INTEGER;if(s===Qh)return i.RGBA_INTEGER;if(s===cc||s===uc||s===fc||s===hc)if(c===Dt)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(s===cc)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===uc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===fc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===hc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(s===cc)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===uc)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===fc)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===hc)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===lh||s===ch||s===uh||s===fh)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(s===lh)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===ch)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===uh)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===fh)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===hh||s===dh||s===ph)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(s===hh||s===dh)return c===Dt?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(s===ph)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===mh||s===gh||s===vh||s===_h||s===xh||s===yh||s===Sh||s===Mh||s===Eh||s===wh||s===Th||s===Ah||s===Ch||s===Rh)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(s===mh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===gh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===vh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===_h)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===xh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===yh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Sh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Mh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Eh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===wh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Th)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Ah)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Ch)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Rh)return c===Dt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===dc||s===Ph||s===bh)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(s===dc)return c===Dt?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Ph)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===bh)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===b0||s===Lh||s===Dh||s===Nh)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(s===dc)return l.COMPRESSED_RED_RGTC1_EXT;if(s===Lh)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Dh)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Nh)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===xo?i.UNSIGNED_INT_24_8:i[s]!==void 0?i[s]:null}return{convert:t}}class v1 extends li{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class un extends dn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const _1={type:"move"};class Uf{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new un,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new un,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new G,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new G),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new un,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new G,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new G),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const s of e.hand.values())this._getHandJoint(t,s)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,s){let o=null,l=null,c=null;const f=this._targetRay,h=this._grip,d=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(d&&e.hand){c=!0;for(const E of e.hand.values()){const S=t.getJointPose(E,s),v=this._getHandJoint(d,E);S!==null&&(v.matrix.fromArray(S.transform.matrix),v.matrix.decompose(v.position,v.rotation,v.scale),v.matrixWorldNeedsUpdate=!0,v.jointRadius=S.radius),v.visible=S!==null}const m=d.joints["index-finger-tip"],_=d.joints["thumb-tip"],g=m.position.distanceTo(_.position),y=.02,M=.005;d.inputState.pinching&&g>y+M?(d.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!d.inputState.pinching&&g<=y-M&&(d.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else h!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,s),l!==null&&(h.matrix.fromArray(l.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,l.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(l.linearVelocity)):h.hasLinearVelocity=!1,l.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(l.angularVelocity)):h.hasAngularVelocity=!1));f!==null&&(o=t.getPose(e.targetRaySpace,s),o===null&&l!==null&&(o=l),o!==null&&(f.matrix.fromArray(o.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,o.linearVelocity?(f.hasLinearVelocity=!0,f.linearVelocity.copy(o.linearVelocity)):f.hasLinearVelocity=!1,o.angularVelocity?(f.hasAngularVelocity=!0,f.angularVelocity.copy(o.angularVelocity)):f.hasAngularVelocity=!1,this.dispatchEvent(_1)))}return f!==null&&(f.visible=o!==null),h!==null&&(h.visible=l!==null),d!==null&&(d.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const s=new un;s.matrixAutoUpdate=!1,s.visible=!1,e.joints[t.jointName]=s,e.add(s)}return e.joints[t.jointName]}}const x1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,y1=`
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

}`;class S1{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,s){if(this.texture===null){const o=new Nn,l=e.properties.get(o);l.__webglTexture=t.texture,(t.depthNear!=s.depthNear||t.depthFar!=s.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=o}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,s=new Wr({vertexShader:x1,fragmentShader:y1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Nt(new To(20,20),s)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class M1 extends wo{constructor(e,t){super();const s=this;let o=null,l=1,c=null,f="local-floor",h=1,d=null,m=null,_=null,g=null,y=null,M=null;const E=new S1,S=t.getContextAttributes();let v=null,L=null;const R=[],T=[],B=new ze;let I=null;const O=new li;O.viewport=new Xt;const z=new li;z.viewport=new Xt;const P=[O,z],A=new v1;let U=null,Q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let he=R[J];return he===void 0&&(he=new Uf,R[J]=he),he.getTargetRaySpace()},this.getControllerGrip=function(J){let he=R[J];return he===void 0&&(he=new Uf,R[J]=he),he.getGripSpace()},this.getHand=function(J){let he=R[J];return he===void 0&&(he=new Uf,R[J]=he),he.getHandSpace()};function Y(J){const he=T.indexOf(J.inputSource);if(he===-1)return;const Me=R[he];Me!==void 0&&(Me.update(J.inputSource,J.frame,d||c),Me.dispatchEvent({type:J.type,data:J.inputSource}))}function ie(){o.removeEventListener("select",Y),o.removeEventListener("selectstart",Y),o.removeEventListener("selectend",Y),o.removeEventListener("squeeze",Y),o.removeEventListener("squeezestart",Y),o.removeEventListener("squeezeend",Y),o.removeEventListener("end",ie),o.removeEventListener("inputsourceschange",le);for(let J=0;J<R.length;J++){const he=T[J];he!==null&&(T[J]=null,R[J].disconnect(he))}U=null,Q=null,E.reset(),e.setRenderTarget(v),y=null,g=null,_=null,o=null,L=null,Fe.stop(),s.isPresenting=!1,e.setPixelRatio(I),e.setSize(B.width,B.height,!1),s.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){l=J,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){f=J,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return d||c},this.setReferenceSpace=function(J){d=J},this.getBaseLayer=function(){return g!==null?g:y},this.getBinding=function(){return _},this.getFrame=function(){return M},this.getSession=function(){return o},this.setSession=async function(J){if(o=J,o!==null){if(v=e.getRenderTarget(),o.addEventListener("select",Y),o.addEventListener("selectstart",Y),o.addEventListener("selectend",Y),o.addEventListener("squeeze",Y),o.addEventListener("squeezestart",Y),o.addEventListener("squeezeend",Y),o.addEventListener("end",ie),o.addEventListener("inputsourceschange",le),S.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(B),o.renderState.layers===void 0){const he={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:l};y=new XRWebGLLayer(o,t,he),o.updateRenderState({baseLayer:y}),e.setPixelRatio(1),e.setSize(y.framebufferWidth,y.framebufferHeight,!1),L=new _s(y.framebufferWidth,y.framebufferHeight,{format:Mi,type:ur,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil})}else{let he=null,Me=null,de=null;S.depth&&(de=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,he=S.stencil?yo:ho,Me=S.stencil?xo:vs);const Pe={colorFormat:t.RGBA8,depthFormat:de,scaleFactor:l};_=new XRWebGLBinding(o,t),g=_.createProjectionLayer(Pe),o.updateRenderState({layers:[g]}),e.setPixelRatio(1),e.setSize(g.textureWidth,g.textureHeight,!1),L=new _s(g.textureWidth,g.textureHeight,{format:Mi,type:ur,depthTexture:new X0(g.textureWidth,g.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,he),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:g.ignoreDepthValues===!1})}L.isXRRenderTarget=!0,this.setFoveation(h),d=null,c=await o.requestReferenceSpace(f),Fe.setContext(o),Fe.start(),s.isPresenting=!0,s.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function le(J){for(let he=0;he<J.removed.length;he++){const Me=J.removed[he],de=T.indexOf(Me);de>=0&&(T[de]=null,R[de].disconnect(Me))}for(let he=0;he<J.added.length;he++){const Me=J.added[he];let de=T.indexOf(Me);if(de===-1){for(let He=0;He<R.length;He++)if(He>=T.length){T.push(Me),de=He;break}else if(T[He]===null){T[He]=Me,de=He;break}if(de===-1)break}const Pe=R[de];Pe&&Pe.connect(Me)}}const se=new G,ce=new G;function V(J,he,Me){se.setFromMatrixPosition(he.matrixWorld),ce.setFromMatrixPosition(Me.matrixWorld);const de=se.distanceTo(ce),Pe=he.projectionMatrix.elements,He=Me.projectionMatrix.elements,Ze=Pe[14]/(Pe[10]-1),vt=Pe[14]/(Pe[10]+1),ve=(Pe[9]+1)/Pe[5],Ae=(Pe[9]-1)/Pe[5],F=(Pe[8]-1)/Pe[0],Qe=(He[8]+1)/He[0],Ee=Ze*F,Ve=Ze*Qe,be=de/(-F+Qe),it=be*-F;if(he.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(it),J.translateZ(be),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Pe[10]===-1)J.projectionMatrix.copy(he.projectionMatrix),J.projectionMatrixInverse.copy(he.projectionMatrixInverse);else{const Oe=Ze+be,D=vt+be,C=Ee-it,$=Ve+(de-it),pe=ve*vt/D*Oe,_e=Ae*vt/D*Oe;J.projectionMatrix.makePerspective(C,$,pe,_e,Oe,D),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function ue(J,he){he===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(he.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(o===null)return;let he=J.near,Me=J.far;E.texture!==null&&(E.depthNear>0&&(he=E.depthNear),E.depthFar>0&&(Me=E.depthFar)),A.near=z.near=O.near=he,A.far=z.far=O.far=Me,(U!==A.near||Q!==A.far)&&(o.updateRenderState({depthNear:A.near,depthFar:A.far}),U=A.near,Q=A.far),O.layers.mask=J.layers.mask|2,z.layers.mask=J.layers.mask|4,A.layers.mask=O.layers.mask|z.layers.mask;const de=J.parent,Pe=A.cameras;ue(A,de);for(let He=0;He<Pe.length;He++)ue(Pe[He],de);Pe.length===2?V(A,O,z):A.projectionMatrix.copy(O.projectionMatrix),oe(J,A,de)};function oe(J,he,Me){Me===null?J.matrix.copy(he.matrixWorld):(J.matrix.copy(Me.matrixWorld),J.matrix.invert(),J.matrix.multiply(he.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(he.projectionMatrix),J.projectionMatrixInverse.copy(he.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Sa*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(!(g===null&&y===null))return h},this.setFoveation=function(J){h=J,g!==null&&(g.fixedFoveation=J),y!==null&&y.fixedFoveation!==void 0&&(y.fixedFoveation=J)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(A)};let k=null;function ee(J,he){if(m=he.getViewerPose(d||c),M=he,m!==null){const Me=m.views;y!==null&&(e.setRenderTargetFramebuffer(L,y.framebuffer),e.setRenderTarget(L));let de=!1;Me.length!==A.cameras.length&&(A.cameras.length=0,de=!0);for(let He=0;He<Me.length;He++){const Ze=Me[He];let vt=null;if(y!==null)vt=y.getViewport(Ze);else{const Ae=_.getViewSubImage(g,Ze);vt=Ae.viewport,He===0&&(e.setRenderTargetTextures(L,Ae.colorTexture,g.ignoreDepthValues?void 0:Ae.depthStencilTexture),e.setRenderTarget(L))}let ve=P[He];ve===void 0&&(ve=new li,ve.layers.enable(He),ve.viewport=new Xt,P[He]=ve),ve.matrix.fromArray(Ze.transform.matrix),ve.matrix.decompose(ve.position,ve.quaternion,ve.scale),ve.projectionMatrix.fromArray(Ze.projectionMatrix),ve.projectionMatrixInverse.copy(ve.projectionMatrix).invert(),ve.viewport.set(vt.x,vt.y,vt.width,vt.height),He===0&&(A.matrix.copy(ve.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),de===!0&&A.cameras.push(ve)}const Pe=o.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")){const He=_.getDepthInformation(Me[0]);He&&He.isValid&&He.texture&&E.init(e,He,o.renderState)}}for(let Me=0;Me<R.length;Me++){const de=T[Me],Pe=R[Me];de!==null&&Pe!==void 0&&Pe.update(de,he,d||c)}k&&k(J,he),he.detectedPlanes&&s.dispatchEvent({type:"planesdetected",data:he}),M=null}const Fe=new G0;Fe.setAnimationLoop(ee),this.setAnimationLoop=function(J){k=J},this.dispose=function(){}}}const us=new Ci,E1=new Gt;function w1(i,e){function t(S,v){S.matrixAutoUpdate===!0&&S.updateMatrix(),v.value.copy(S.matrix)}function s(S,v){v.color.getRGB(S.fogColor.value,B0(i)),v.isFog?(S.fogNear.value=v.near,S.fogFar.value=v.far):v.isFogExp2&&(S.fogDensity.value=v.density)}function o(S,v,L,R,T){v.isMeshBasicMaterial||v.isMeshLambertMaterial?l(S,v):v.isMeshToonMaterial?(l(S,v),_(S,v)):v.isMeshPhongMaterial?(l(S,v),m(S,v)):v.isMeshStandardMaterial?(l(S,v),g(S,v),v.isMeshPhysicalMaterial&&y(S,v,T)):v.isMeshMatcapMaterial?(l(S,v),M(S,v)):v.isMeshDepthMaterial?l(S,v):v.isMeshDistanceMaterial?(l(S,v),E(S,v)):v.isMeshNormalMaterial?l(S,v):v.isLineBasicMaterial?(c(S,v),v.isLineDashedMaterial&&f(S,v)):v.isPointsMaterial?h(S,v,L,R):v.isSpriteMaterial?d(S,v):v.isShadowMaterial?(S.color.value.copy(v.color),S.opacity.value=v.opacity):v.isShaderMaterial&&(v.uniformsNeedUpdate=!1)}function l(S,v){S.opacity.value=v.opacity,v.color&&S.diffuse.value.copy(v.color),v.emissive&&S.emissive.value.copy(v.emissive).multiplyScalar(v.emissiveIntensity),v.map&&(S.map.value=v.map,t(v.map,S.mapTransform)),v.alphaMap&&(S.alphaMap.value=v.alphaMap,t(v.alphaMap,S.alphaMapTransform)),v.bumpMap&&(S.bumpMap.value=v.bumpMap,t(v.bumpMap,S.bumpMapTransform),S.bumpScale.value=v.bumpScale,v.side===Dn&&(S.bumpScale.value*=-1)),v.normalMap&&(S.normalMap.value=v.normalMap,t(v.normalMap,S.normalMapTransform),S.normalScale.value.copy(v.normalScale),v.side===Dn&&S.normalScale.value.negate()),v.displacementMap&&(S.displacementMap.value=v.displacementMap,t(v.displacementMap,S.displacementMapTransform),S.displacementScale.value=v.displacementScale,S.displacementBias.value=v.displacementBias),v.emissiveMap&&(S.emissiveMap.value=v.emissiveMap,t(v.emissiveMap,S.emissiveMapTransform)),v.specularMap&&(S.specularMap.value=v.specularMap,t(v.specularMap,S.specularMapTransform)),v.alphaTest>0&&(S.alphaTest.value=v.alphaTest);const L=e.get(v),R=L.envMap,T=L.envMapRotation;R&&(S.envMap.value=R,us.copy(T),us.x*=-1,us.y*=-1,us.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(us.y*=-1,us.z*=-1),S.envMapRotation.value.setFromMatrix4(E1.makeRotationFromEuler(us)),S.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,S.reflectivity.value=v.reflectivity,S.ior.value=v.ior,S.refractionRatio.value=v.refractionRatio),v.lightMap&&(S.lightMap.value=v.lightMap,S.lightMapIntensity.value=v.lightMapIntensity,t(v.lightMap,S.lightMapTransform)),v.aoMap&&(S.aoMap.value=v.aoMap,S.aoMapIntensity.value=v.aoMapIntensity,t(v.aoMap,S.aoMapTransform))}function c(S,v){S.diffuse.value.copy(v.color),S.opacity.value=v.opacity,v.map&&(S.map.value=v.map,t(v.map,S.mapTransform))}function f(S,v){S.dashSize.value=v.dashSize,S.totalSize.value=v.dashSize+v.gapSize,S.scale.value=v.scale}function h(S,v,L,R){S.diffuse.value.copy(v.color),S.opacity.value=v.opacity,S.size.value=v.size*L,S.scale.value=R*.5,v.map&&(S.map.value=v.map,t(v.map,S.uvTransform)),v.alphaMap&&(S.alphaMap.value=v.alphaMap,t(v.alphaMap,S.alphaMapTransform)),v.alphaTest>0&&(S.alphaTest.value=v.alphaTest)}function d(S,v){S.diffuse.value.copy(v.color),S.opacity.value=v.opacity,S.rotation.value=v.rotation,v.map&&(S.map.value=v.map,t(v.map,S.mapTransform)),v.alphaMap&&(S.alphaMap.value=v.alphaMap,t(v.alphaMap,S.alphaMapTransform)),v.alphaTest>0&&(S.alphaTest.value=v.alphaTest)}function m(S,v){S.specular.value.copy(v.specular),S.shininess.value=Math.max(v.shininess,1e-4)}function _(S,v){v.gradientMap&&(S.gradientMap.value=v.gradientMap)}function g(S,v){S.metalness.value=v.metalness,v.metalnessMap&&(S.metalnessMap.value=v.metalnessMap,t(v.metalnessMap,S.metalnessMapTransform)),S.roughness.value=v.roughness,v.roughnessMap&&(S.roughnessMap.value=v.roughnessMap,t(v.roughnessMap,S.roughnessMapTransform)),v.envMap&&(S.envMapIntensity.value=v.envMapIntensity)}function y(S,v,L){S.ior.value=v.ior,v.sheen>0&&(S.sheenColor.value.copy(v.sheenColor).multiplyScalar(v.sheen),S.sheenRoughness.value=v.sheenRoughness,v.sheenColorMap&&(S.sheenColorMap.value=v.sheenColorMap,t(v.sheenColorMap,S.sheenColorMapTransform)),v.sheenRoughnessMap&&(S.sheenRoughnessMap.value=v.sheenRoughnessMap,t(v.sheenRoughnessMap,S.sheenRoughnessMapTransform))),v.clearcoat>0&&(S.clearcoat.value=v.clearcoat,S.clearcoatRoughness.value=v.clearcoatRoughness,v.clearcoatMap&&(S.clearcoatMap.value=v.clearcoatMap,t(v.clearcoatMap,S.clearcoatMapTransform)),v.clearcoatRoughnessMap&&(S.clearcoatRoughnessMap.value=v.clearcoatRoughnessMap,t(v.clearcoatRoughnessMap,S.clearcoatRoughnessMapTransform)),v.clearcoatNormalMap&&(S.clearcoatNormalMap.value=v.clearcoatNormalMap,t(v.clearcoatNormalMap,S.clearcoatNormalMapTransform),S.clearcoatNormalScale.value.copy(v.clearcoatNormalScale),v.side===Dn&&S.clearcoatNormalScale.value.negate())),v.dispersion>0&&(S.dispersion.value=v.dispersion),v.iridescence>0&&(S.iridescence.value=v.iridescence,S.iridescenceIOR.value=v.iridescenceIOR,S.iridescenceThicknessMinimum.value=v.iridescenceThicknessRange[0],S.iridescenceThicknessMaximum.value=v.iridescenceThicknessRange[1],v.iridescenceMap&&(S.iridescenceMap.value=v.iridescenceMap,t(v.iridescenceMap,S.iridescenceMapTransform)),v.iridescenceThicknessMap&&(S.iridescenceThicknessMap.value=v.iridescenceThicknessMap,t(v.iridescenceThicknessMap,S.iridescenceThicknessMapTransform))),v.transmission>0&&(S.transmission.value=v.transmission,S.transmissionSamplerMap.value=L.texture,S.transmissionSamplerSize.value.set(L.width,L.height),v.transmissionMap&&(S.transmissionMap.value=v.transmissionMap,t(v.transmissionMap,S.transmissionMapTransform)),S.thickness.value=v.thickness,v.thicknessMap&&(S.thicknessMap.value=v.thicknessMap,t(v.thicknessMap,S.thicknessMapTransform)),S.attenuationDistance.value=v.attenuationDistance,S.attenuationColor.value.copy(v.attenuationColor)),v.anisotropy>0&&(S.anisotropyVector.value.set(v.anisotropy*Math.cos(v.anisotropyRotation),v.anisotropy*Math.sin(v.anisotropyRotation)),v.anisotropyMap&&(S.anisotropyMap.value=v.anisotropyMap,t(v.anisotropyMap,S.anisotropyMapTransform))),S.specularIntensity.value=v.specularIntensity,S.specularColor.value.copy(v.specularColor),v.specularColorMap&&(S.specularColorMap.value=v.specularColorMap,t(v.specularColorMap,S.specularColorMapTransform)),v.specularIntensityMap&&(S.specularIntensityMap.value=v.specularIntensityMap,t(v.specularIntensityMap,S.specularIntensityMapTransform))}function M(S,v){v.matcap&&(S.matcap.value=v.matcap)}function E(S,v){const L=e.get(v).light;S.referencePosition.value.setFromMatrixPosition(L.matrixWorld),S.nearDistance.value=L.shadow.camera.near,S.farDistance.value=L.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:o}}function T1(i,e,t,s){let o={},l={},c=[];const f=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function h(L,R){const T=R.program;s.uniformBlockBinding(L,T)}function d(L,R){let T=o[L.id];T===void 0&&(M(L),T=m(L),o[L.id]=T,L.addEventListener("dispose",S));const B=R.program;s.updateUBOMapping(L,B);const I=e.render.frame;l[L.id]!==I&&(g(L),l[L.id]=I)}function m(L){const R=_();L.__bindingPointIndex=R;const T=i.createBuffer(),B=L.__size,I=L.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,B,I),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,R,T),T}function _(){for(let L=0;L<f;L++)if(c.indexOf(L)===-1)return c.push(L),L;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function g(L){const R=o[L.id],T=L.uniforms,B=L.__cache;i.bindBuffer(i.UNIFORM_BUFFER,R);for(let I=0,O=T.length;I<O;I++){const z=Array.isArray(T[I])?T[I]:[T[I]];for(let P=0,A=z.length;P<A;P++){const U=z[P];if(y(U,I,P,B)===!0){const Q=U.__offset,Y=Array.isArray(U.value)?U.value:[U.value];let ie=0;for(let le=0;le<Y.length;le++){const se=Y[le],ce=E(se);typeof se=="number"||typeof se=="boolean"?(U.__data[0]=se,i.bufferSubData(i.UNIFORM_BUFFER,Q+ie,U.__data)):se.isMatrix3?(U.__data[0]=se.elements[0],U.__data[1]=se.elements[1],U.__data[2]=se.elements[2],U.__data[3]=0,U.__data[4]=se.elements[3],U.__data[5]=se.elements[4],U.__data[6]=se.elements[5],U.__data[7]=0,U.__data[8]=se.elements[6],U.__data[9]=se.elements[7],U.__data[10]=se.elements[8],U.__data[11]=0):(se.toArray(U.__data,ie),ie+=ce.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,Q,U.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function y(L,R,T,B){const I=L.value,O=R+"_"+T;if(B[O]===void 0)return typeof I=="number"||typeof I=="boolean"?B[O]=I:B[O]=I.clone(),!0;{const z=B[O];if(typeof I=="number"||typeof I=="boolean"){if(z!==I)return B[O]=I,!0}else if(z.equals(I)===!1)return z.copy(I),!0}return!1}function M(L){const R=L.uniforms;let T=0;const B=16;for(let O=0,z=R.length;O<z;O++){const P=Array.isArray(R[O])?R[O]:[R[O]];for(let A=0,U=P.length;A<U;A++){const Q=P[A],Y=Array.isArray(Q.value)?Q.value:[Q.value];for(let ie=0,le=Y.length;ie<le;ie++){const se=Y[ie],ce=E(se),V=T%B,ue=V%ce.boundary,oe=V+ue;T+=ue,oe!==0&&B-oe<ce.storage&&(T+=B-oe),Q.__data=new Float32Array(ce.storage/Float32Array.BYTES_PER_ELEMENT),Q.__offset=T,T+=ce.storage}}}const I=T%B;return I>0&&(T+=B-I),L.__size=T,L.__cache={},this}function E(L){const R={boundary:0,storage:0};return typeof L=="number"||typeof L=="boolean"?(R.boundary=4,R.storage=4):L.isVector2?(R.boundary=8,R.storage=8):L.isVector3||L.isColor?(R.boundary=16,R.storage=12):L.isVector4?(R.boundary=16,R.storage=16):L.isMatrix3?(R.boundary=48,R.storage=48):L.isMatrix4?(R.boundary=64,R.storage=64):L.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",L),R}function S(L){const R=L.target;R.removeEventListener("dispose",S);const T=c.indexOf(R.__bindingPointIndex);c.splice(T,1),i.deleteBuffer(o[R.id]),delete o[R.id],delete l[R.id]}function v(){for(const L in o)i.deleteBuffer(o[L]);c=[],o={},l={}}return{bind:h,update:d,dispose:v}}class A1{constructor(e={}){const{canvas:t=dy(),context:s=null,depth:o=!0,stencil:l=!1,alpha:c=!1,antialias:f=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:d=!1,powerPreference:m="default",failIfMajorPerformanceCaveat:_=!1,reverseDepthBuffer:g=!1}=e;this.isWebGLRenderer=!0;let y;if(s!==null){if(typeof WebGLRenderingContext<"u"&&s instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");y=s.getContextAttributes().alpha}else y=c;const M=new Uint32Array(4),E=new Int32Array(4);let S=null,v=null;const L=[],R=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=fn,this.toneMapping=Vr,this.toneMappingExposure=1;const T=this;let B=!1,I=0,O=0,z=null,P=-1,A=null;const U=new Xt,Q=new Xt;let Y=null;const ie=new Mt(0);let le=0,se=t.width,ce=t.height,V=1,ue=null,oe=null;const k=new Xt(0,0,se,ce),ee=new Xt(0,0,se,ce);let Fe=!1;const J=new td;let he=!1,Me=!1;const de=new Gt,Pe=new Gt,He=new G,Ze=new Xt,vt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ve=!1;function Ae(){return z===null?V:1}let F=s;function Qe(b,j){return t.getContext(b,j)}try{const b={alpha:!0,depth:o,stencil:l,antialias:f,premultipliedAlpha:h,preserveDrawingBuffer:d,powerPreference:m,failIfMajorPerformanceCaveat:_};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${jh}`),t.addEventListener("webglcontextlost",ge,!1),t.addEventListener("webglcontextrestored",ke,!1),t.addEventListener("webglcontextcreationerror",Ue,!1),F===null){const j="webgl2";if(F=Qe(j,b),F===null)throw Qe(j)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Ee,Ve,be,it,Oe,D,C,$,pe,_e,me,Ye,De,Ge,dt,we,Xe,ot,at,je,_t,ft,bt,X;function Ne(){Ee=new LE(F),Ee.init(),ft=new g1(F,Ee),Ve=new TE(F,Ee,e,ft),be=new d1(F,Ee),Ve.reverseDepthBuffer&&g&&be.buffers.depth.setReversed(!0),it=new IE(F),Oe=new Qw,D=new m1(F,Ee,be,Oe,Ve,ft,it),C=new CE(T),$=new bE(T),pe=new Hy(F),bt=new EE(F,pe),_e=new DE(F,pe,it,bt),me=new FE(F,_e,pe,it),at=new UE(F,Ve,D),we=new AE(Oe),Ye=new Zw(T,C,$,Ee,Ve,bt,we),De=new w1(T,Oe),Ge=new e1,dt=new o1(Ee),ot=new ME(T,C,$,be,me,y,h),Xe=new f1(T,me,Ve),X=new T1(F,it,Ve,be),je=new wE(F,Ee,it),_t=new NE(F,Ee,it),it.programs=Ye.programs,T.capabilities=Ve,T.extensions=Ee,T.properties=Oe,T.renderLists=Ge,T.shadowMap=Xe,T.state=be,T.info=it}Ne();const ae=new M1(T,F);this.xr=ae,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const b=Ee.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Ee.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(b){b!==void 0&&(V=b,this.setSize(se,ce,!1))},this.getSize=function(b){return b.set(se,ce)},this.setSize=function(b,j,ne=!0){if(ae.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}se=b,ce=j,t.width=Math.floor(b*V),t.height=Math.floor(j*V),ne===!0&&(t.style.width=b+"px",t.style.height=j+"px"),this.setViewport(0,0,b,j)},this.getDrawingBufferSize=function(b){return b.set(se*V,ce*V).floor()},this.setDrawingBufferSize=function(b,j,ne){se=b,ce=j,V=ne,t.width=Math.floor(b*ne),t.height=Math.floor(j*ne),this.setViewport(0,0,b,j)},this.getCurrentViewport=function(b){return b.copy(U)},this.getViewport=function(b){return b.copy(k)},this.setViewport=function(b,j,ne,re){b.isVector4?k.set(b.x,b.y,b.z,b.w):k.set(b,j,ne,re),be.viewport(U.copy(k).multiplyScalar(V).round())},this.getScissor=function(b){return b.copy(ee)},this.setScissor=function(b,j,ne,re){b.isVector4?ee.set(b.x,b.y,b.z,b.w):ee.set(b,j,ne,re),be.scissor(Q.copy(ee).multiplyScalar(V).round())},this.getScissorTest=function(){return Fe},this.setScissorTest=function(b){be.setScissorTest(Fe=b)},this.setOpaqueSort=function(b){ue=b},this.setTransparentSort=function(b){oe=b},this.getClearColor=function(b){return b.copy(ot.getClearColor())},this.setClearColor=function(){ot.setClearColor.apply(ot,arguments)},this.getClearAlpha=function(){return ot.getClearAlpha()},this.setClearAlpha=function(){ot.setClearAlpha.apply(ot,arguments)},this.clear=function(b=!0,j=!0,ne=!0){let re=0;if(b){let q=!1;if(z!==null){const Re=z.texture.format;q=Re===Qh||Re===Zh||Re===$h}if(q){const Re=z.texture.type,Te=Re===ur||Re===vs||Re===ya||Re===xo||Re===Yh||Re===Kh,Je=ot.getClearColor(),Ke=ot.getClearAlpha(),lt=Je.r,ut=Je.g,et=Je.b;Te?(M[0]=lt,M[1]=ut,M[2]=et,M[3]=Ke,F.clearBufferuiv(F.COLOR,0,M)):(E[0]=lt,E[1]=ut,E[2]=et,E[3]=Ke,F.clearBufferiv(F.COLOR,0,E))}else re|=F.COLOR_BUFFER_BIT}j&&(re|=F.DEPTH_BUFFER_BIT),ne&&(re|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(re)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ge,!1),t.removeEventListener("webglcontextrestored",ke,!1),t.removeEventListener("webglcontextcreationerror",Ue,!1),Ge.dispose(),dt.dispose(),Oe.dispose(),C.dispose(),$.dispose(),me.dispose(),bt.dispose(),X.dispose(),Ye.dispose(),ae.dispose(),ae.removeEventListener("sessionstart",Ss),ae.removeEventListener("sessionend",fr),Hi.stop()};function ge(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),B=!0}function ke(){console.log("THREE.WebGLRenderer: Context Restored."),B=!1;const b=it.autoReset,j=Xe.enabled,ne=Xe.autoUpdate,re=Xe.needsUpdate,q=Xe.type;Ne(),it.autoReset=b,Xe.enabled=j,Xe.autoUpdate=ne,Xe.needsUpdate=re,Xe.type=q}function Ue(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function ht(b){const j=b.target;j.removeEventListener("dispose",ht),Ft(j)}function Ft(b){$t(b),Oe.remove(b)}function $t(b){const j=Oe.get(b).programs;j!==void 0&&(j.forEach(function(ne){Ye.releaseProgram(ne)}),b.isShaderMaterial&&Ye.releaseShaderCache(b))}this.renderBufferDirect=function(b,j,ne,re,q,Re){j===null&&(j=vt);const Te=q.isMesh&&q.matrixWorld.determinant()<0,Je=La(b,j,ne,re,q);be.setMaterial(re,Te);let Ke=ne.index,lt=1;if(re.wireframe===!0){if(Ke=_e.getWireframeAttribute(ne),Ke===void 0)return;lt=2}const ut=ne.drawRange,et=ne.attributes.position;let St=ut.start*lt,Pt=(ut.start+ut.count)*lt;Re!==null&&(St=Math.max(St,Re.start*lt),Pt=Math.min(Pt,(Re.start+Re.count)*lt)),Ke!==null?(St=Math.max(St,0),Pt=Math.min(Pt,Ke.count)):et!=null&&(St=Math.max(St,0),Pt=Math.min(Pt,et.count));const yt=Pt-St;if(yt<0||yt===1/0)return;bt.setup(q,re,Je,ne,Ke);let pn,pt=je;if(Ke!==null&&(pn=pe.get(Ke),pt=_t,pt.setIndex(pn)),q.isMesh)re.wireframe===!0?(be.setLineWidth(re.wireframeLinewidth*Ae()),pt.setMode(F.LINES)):pt.setMode(F.TRIANGLES);else if(q.isLine){let nt=re.linewidth;nt===void 0&&(nt=1),be.setLineWidth(nt*Ae()),q.isLineSegments?pt.setMode(F.LINES):q.isLineLoop?pt.setMode(F.LINE_LOOP):pt.setMode(F.LINE_STRIP)}else q.isPoints?pt.setMode(F.POINTS):q.isSprite&&pt.setMode(F.TRIANGLES);if(q.isBatchedMesh)if(q._multiDrawInstances!==null)pt.renderMultiDrawInstances(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount,q._multiDrawInstances);else if(Ee.get("WEBGL_multi_draw"))pt.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{const nt=q._multiDrawStarts,ui=q._multiDrawCounts,Ct=q._multiDrawCount,mn=Ke?pe.get(Ke).bytesPerElement:1,fi=Oe.get(re).currentProgram.getUniforms();for(let Zt=0;Zt<Ct;Zt++)fi.setValue(F,"_gl_DrawID",Zt),pt.render(nt[Zt]/mn,ui[Zt])}else if(q.isInstancedMesh)pt.renderInstances(St,yt,q.count);else if(ne.isInstancedBufferGeometry){const nt=ne._maxInstanceCount!==void 0?ne._maxInstanceCount:1/0,ui=Math.min(ne.instanceCount,nt);pt.renderInstances(St,yt,ui)}else pt.render(St,yt)};function Et(b,j,ne){b.transparent===!0&&b.side===ci&&b.forceSinglePass===!1?(b.side=Dn,b.needsUpdate=!0,Ms(b,j,ne),b.side=Gr,b.needsUpdate=!0,Ms(b,j,ne),b.side=ci):Ms(b,j,ne)}this.compile=function(b,j,ne=null){ne===null&&(ne=b),v=dt.get(ne),v.init(j),R.push(v),ne.traverseVisible(function(q){q.isLight&&q.layers.test(j.layers)&&(v.pushLight(q),q.castShadow&&v.pushShadow(q))}),b!==ne&&b.traverseVisible(function(q){q.isLight&&q.layers.test(j.layers)&&(v.pushLight(q),q.castShadow&&v.pushShadow(q))}),v.setupLights();const re=new Set;return b.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;const Re=q.material;if(Re)if(Array.isArray(Re))for(let Te=0;Te<Re.length;Te++){const Je=Re[Te];Et(Je,ne,q),re.add(Je)}else Et(Re,ne,q),re.add(Re)}),R.pop(),v=null,re},this.compileAsync=function(b,j,ne=null){const re=this.compile(b,j,ne);return new Promise(q=>{function Re(){if(re.forEach(function(Te){Oe.get(Te).currentProgram.isReady()&&re.delete(Te)}),re.size===0){q(b);return}setTimeout(Re,10)}Ee.get("KHR_parallel_shader_compile")!==null?Re():setTimeout(Re,10)})};let Un=null;function En(b){Un&&Un(b)}function Ss(){Hi.stop()}function fr(){Hi.start()}const Hi=new G0;Hi.setAnimationLoop(En),typeof self<"u"&&Hi.setContext(self),this.setAnimationLoop=function(b){Un=b,ae.setAnimationLoop(b),b===null?Hi.stop():Hi.start()},ae.addEventListener("sessionstart",Ss),ae.addEventListener("sessionend",fr),this.render=function(b,j){if(j!==void 0&&j.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(B===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),j.parent===null&&j.matrixWorldAutoUpdate===!0&&j.updateMatrixWorld(),ae.enabled===!0&&ae.isPresenting===!0&&(ae.cameraAutoUpdate===!0&&ae.updateCamera(j),j=ae.getCamera()),b.isScene===!0&&b.onBeforeRender(T,b,j,z),v=dt.get(b,R.length),v.init(j),R.push(v),Pe.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),J.setFromProjectionMatrix(Pe),Me=this.localClippingEnabled,he=we.init(this.clippingPlanes,Me),S=Ge.get(b,L.length),S.init(),L.push(S),ae.enabled===!0&&ae.isPresenting===!0){const Re=T.xr.getDepthSensingMesh();Re!==null&&Vi(Re,j,-1/0,T.sortObjects)}Vi(b,j,0,T.sortObjects),S.finish(),T.sortObjects===!0&&S.sort(ue,oe),ve=ae.enabled===!1||ae.isPresenting===!1||ae.hasDepthSensing()===!1,ve&&ot.addToRenderList(S,b),this.info.render.frame++,he===!0&&we.beginShadows();const ne=v.state.shadowsArray;Xe.render(ne,b,j),he===!0&&we.endShadows(),this.info.autoReset===!0&&this.info.reset();const re=S.opaque,q=S.transmissive;if(v.setupLights(),j.isArrayCamera){const Re=j.cameras;if(q.length>0)for(let Te=0,Je=Re.length;Te<Je;Te++){const Ke=Re[Te];jr(re,q,b,Ke)}ve&&ot.render(b);for(let Te=0,Je=Re.length;Te<Je;Te++){const Ke=Re[Te];Xr(S,b,Ke,Ke.viewport)}}else q.length>0&&jr(re,q,b,j),ve&&ot.render(b),Xr(S,b,j);z!==null&&(D.updateMultisampleRenderTarget(z),D.updateRenderTargetMipmap(z)),b.isScene===!0&&b.onAfterRender(T,b,j),bt.resetDefaultState(),P=-1,A=null,R.pop(),R.length>0?(v=R[R.length-1],he===!0&&we.setGlobalState(T.clippingPlanes,v.state.camera)):v=null,L.pop(),L.length>0?S=L[L.length-1]:S=null};function Vi(b,j,ne,re){if(b.visible===!1)return;if(b.layers.test(j.layers)){if(b.isGroup)ne=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(j);else if(b.isLight)v.pushLight(b),b.castShadow&&v.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||J.intersectsSprite(b)){re&&Ze.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Pe);const Te=me.update(b),Je=b.material;Je.visible&&S.push(b,Te,Je,ne,Ze.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||J.intersectsObject(b))){const Te=me.update(b),Je=b.material;if(re&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ze.copy(b.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),Ze.copy(Te.boundingSphere.center)),Ze.applyMatrix4(b.matrixWorld).applyMatrix4(Pe)),Array.isArray(Je)){const Ke=Te.groups;for(let lt=0,ut=Ke.length;lt<ut;lt++){const et=Ke[lt],St=Je[et.materialIndex];St&&St.visible&&S.push(b,Te,St,ne,Ze.z,et)}}else Je.visible&&S.push(b,Te,Je,ne,Ze.z,null)}}const Re=b.children;for(let Te=0,Je=Re.length;Te<Je;Te++)Vi(Re[Te],j,ne,re)}function Xr(b,j,ne,re){const q=b.opaque,Re=b.transmissive,Te=b.transparent;v.setupLightsView(ne),he===!0&&we.setGlobalState(T.clippingPlanes,ne),re&&be.viewport(U.copy(re)),q.length>0&&hr(q,j,ne),Re.length>0&&hr(Re,j,ne),Te.length>0&&hr(Te,j,ne),be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function jr(b,j,ne,re){if((ne.isScene===!0?ne.overrideMaterial:null)!==null)return;v.state.transmissionRenderTarget[re.id]===void 0&&(v.state.transmissionRenderTarget[re.id]=new _s(1,1,{generateMipmaps:!0,type:Ee.has("EXT_color_buffer_half_float")||Ee.has("EXT_color_buffer_float")?Ta:ur,minFilter:gs,samples:4,stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:At.workingColorSpace}));const Re=v.state.transmissionRenderTarget[re.id],Te=re.viewport||U;Re.setSize(Te.z,Te.w);const Je=T.getRenderTarget();T.setRenderTarget(Re),T.getClearColor(ie),le=T.getClearAlpha(),le<1&&T.setClearColor(16777215,.5),T.clear(),ve&&ot.render(ne);const Ke=T.toneMapping;T.toneMapping=Vr;const lt=re.viewport;if(re.viewport!==void 0&&(re.viewport=void 0),v.setupLightsView(re),he===!0&&we.setGlobalState(T.clippingPlanes,re),hr(b,ne,re),D.updateMultisampleRenderTarget(Re),D.updateRenderTargetMipmap(Re),Ee.has("WEBGL_multisampled_render_to_texture")===!1){let ut=!1;for(let et=0,St=j.length;et<St;et++){const Pt=j[et],yt=Pt.object,pn=Pt.geometry,pt=Pt.material,nt=Pt.group;if(pt.side===ci&&yt.layers.test(re.layers)){const ui=pt.side;pt.side=Dn,pt.needsUpdate=!0,Pa(yt,ne,re,pn,pt,nt),pt.side=ui,pt.needsUpdate=!0,ut=!0}}ut===!0&&(D.updateMultisampleRenderTarget(Re),D.updateRenderTargetMipmap(Re))}T.setRenderTarget(Je),T.setClearColor(ie,le),lt!==void 0&&(re.viewport=lt),T.toneMapping=Ke}function hr(b,j,ne){const re=j.isScene===!0?j.overrideMaterial:null;for(let q=0,Re=b.length;q<Re;q++){const Te=b[q],Je=Te.object,Ke=Te.geometry,lt=re===null?Te.material:re,ut=Te.group;Je.layers.test(ne.layers)&&Pa(Je,j,ne,Ke,lt,ut)}}function Pa(b,j,ne,re,q,Re){b.onBeforeRender(T,j,ne,re,q,Re),b.modelViewMatrix.multiplyMatrices(ne.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),q.onBeforeRender(T,j,ne,re,b,Re),q.transparent===!0&&q.side===ci&&q.forceSinglePass===!1?(q.side=Dn,q.needsUpdate=!0,T.renderBufferDirect(ne,j,re,q,b,Re),q.side=Gr,q.needsUpdate=!0,T.renderBufferDirect(ne,j,re,q,b,Re),q.side=ci):T.renderBufferDirect(ne,j,re,q,b,Re),b.onAfterRender(T,j,ne,re,q,Re)}function Ms(b,j,ne){j.isScene!==!0&&(j=vt);const re=Oe.get(b),q=v.state.lights,Re=v.state.shadowsArray,Te=q.state.version,Je=Ye.getParameters(b,q.state,Re,j,ne),Ke=Ye.getProgramCacheKey(Je);let lt=re.programs;re.environment=b.isMeshStandardMaterial?j.environment:null,re.fog=j.fog,re.envMap=(b.isMeshStandardMaterial?$:C).get(b.envMap||re.environment),re.envMapRotation=re.environment!==null&&b.envMap===null?j.environmentRotation:b.envMapRotation,lt===void 0&&(b.addEventListener("dispose",ht),lt=new Map,re.programs=lt);let ut=lt.get(Ke);if(ut!==void 0){if(re.currentProgram===ut&&re.lightsStateVersion===Te)return Ri(b,Je),ut}else Je.uniforms=Ye.getUniforms(b),b.onBeforeCompile(Je,T),ut=Ye.acquireProgram(Je,Ke),lt.set(Ke,ut),re.uniforms=Je.uniforms;const et=re.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(et.clippingPlanes=we.uniform),Ri(b,Je),re.needsLights=wc(b),re.lightsStateVersion=Te,re.needsLights&&(et.ambientLightColor.value=q.state.ambient,et.lightProbe.value=q.state.probe,et.directionalLights.value=q.state.directional,et.directionalLightShadows.value=q.state.directionalShadow,et.spotLights.value=q.state.spot,et.spotLightShadows.value=q.state.spotShadow,et.rectAreaLights.value=q.state.rectArea,et.ltc_1.value=q.state.rectAreaLTC1,et.ltc_2.value=q.state.rectAreaLTC2,et.pointLights.value=q.state.point,et.pointLightShadows.value=q.state.pointShadow,et.hemisphereLights.value=q.state.hemi,et.directionalShadowMap.value=q.state.directionalShadowMap,et.directionalShadowMatrix.value=q.state.directionalShadowMatrix,et.spotShadowMap.value=q.state.spotShadowMap,et.spotLightMatrix.value=q.state.spotLightMatrix,et.spotLightMap.value=q.state.spotLightMap,et.pointShadowMap.value=q.state.pointShadowMap,et.pointShadowMatrix.value=q.state.pointShadowMatrix),re.currentProgram=ut,re.uniformsList=null,ut}function ba(b){if(b.uniformsList===null){const j=b.currentProgram.getUniforms();b.uniformsList=pc.seqWithValue(j.seq,b.uniforms)}return b.uniformsList}function Ri(b,j){const ne=Oe.get(b);ne.outputColorSpace=j.outputColorSpace,ne.batching=j.batching,ne.batchingColor=j.batchingColor,ne.instancing=j.instancing,ne.instancingColor=j.instancingColor,ne.instancingMorph=j.instancingMorph,ne.skinning=j.skinning,ne.morphTargets=j.morphTargets,ne.morphNormals=j.morphNormals,ne.morphColors=j.morphColors,ne.morphTargetsCount=j.morphTargetsCount,ne.numClippingPlanes=j.numClippingPlanes,ne.numIntersection=j.numClipIntersection,ne.vertexAlphas=j.vertexAlphas,ne.vertexTangents=j.vertexTangents,ne.toneMapping=j.toneMapping}function La(b,j,ne,re,q){j.isScene!==!0&&(j=vt),D.resetTextureUnits();const Re=j.fog,Te=re.isMeshStandardMaterial?j.environment:null,Je=z===null?T.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:Eo,Ke=(re.isMeshStandardMaterial?$:C).get(re.envMap||Te),lt=re.vertexColors===!0&&!!ne.attributes.color&&ne.attributes.color.itemSize===4,ut=!!ne.attributes.tangent&&(!!re.normalMap||re.anisotropy>0),et=!!ne.morphAttributes.position,St=!!ne.morphAttributes.normal,Pt=!!ne.morphAttributes.color;let yt=Vr;re.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(yt=T.toneMapping);const pn=ne.morphAttributes.position||ne.morphAttributes.normal||ne.morphAttributes.color,pt=pn!==void 0?pn.length:0,nt=Oe.get(re),ui=v.state.lights;if(he===!0&&(Me===!0||b!==A)){const wn=b===A&&re.id===P;we.setState(re,b,wn)}let Ct=!1;re.version===nt.__version?(nt.needsLights&&nt.lightsStateVersion!==ui.state.version||nt.outputColorSpace!==Je||q.isBatchedMesh&&nt.batching===!1||!q.isBatchedMesh&&nt.batching===!0||q.isBatchedMesh&&nt.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&nt.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&nt.instancing===!1||!q.isInstancedMesh&&nt.instancing===!0||q.isSkinnedMesh&&nt.skinning===!1||!q.isSkinnedMesh&&nt.skinning===!0||q.isInstancedMesh&&nt.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&nt.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&nt.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&nt.instancingMorph===!1&&q.morphTexture!==null||nt.envMap!==Ke||re.fog===!0&&nt.fog!==Re||nt.numClippingPlanes!==void 0&&(nt.numClippingPlanes!==we.numPlanes||nt.numIntersection!==we.numIntersection)||nt.vertexAlphas!==lt||nt.vertexTangents!==ut||nt.morphTargets!==et||nt.morphNormals!==St||nt.morphColors!==Pt||nt.toneMapping!==yt||nt.morphTargetsCount!==pt)&&(Ct=!0):(Ct=!0,nt.__version=re.version);let mn=nt.currentProgram;Ct===!0&&(mn=Ms(re,j,q));let fi=!1,Zt=!1,Pi=!1;const It=mn.getUniforms(),Qn=nt.uniforms;if(be.useProgram(mn.program)&&(fi=!0,Zt=!0,Pi=!0),re.id!==P&&(P=re.id,Zt=!0),fi||A!==b){be.buffers.depth.getReversed()?(de.copy(b.projectionMatrix),my(de),gy(de),It.setValue(F,"projectionMatrix",de)):It.setValue(F,"projectionMatrix",b.projectionMatrix),It.setValue(F,"viewMatrix",b.matrixWorldInverse);const Jn=It.map.cameraPosition;Jn!==void 0&&Jn.setValue(F,He.setFromMatrixPosition(b.matrixWorld)),Ve.logarithmicDepthBuffer&&It.setValue(F,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(re.isMeshPhongMaterial||re.isMeshToonMaterial||re.isMeshLambertMaterial||re.isMeshBasicMaterial||re.isMeshStandardMaterial||re.isShaderMaterial)&&It.setValue(F,"isOrthographic",b.isOrthographicCamera===!0),A!==b&&(A=b,Zt=!0,Pi=!0)}if(q.isSkinnedMesh){It.setOptional(F,q,"bindMatrix"),It.setOptional(F,q,"bindMatrixInverse");const wn=q.skeleton;wn&&(wn.boneTexture===null&&wn.computeBoneTexture(),It.setValue(F,"boneTexture",wn.boneTexture,D))}q.isBatchedMesh&&(It.setOptional(F,q,"batchingTexture"),It.setValue(F,"batchingTexture",q._matricesTexture,D),It.setOptional(F,q,"batchingIdTexture"),It.setValue(F,"batchingIdTexture",q._indirectTexture,D),It.setOptional(F,q,"batchingColorTexture"),q._colorsTexture!==null&&It.setValue(F,"batchingColorTexture",q._colorsTexture,D));const Gi=ne.morphAttributes;if((Gi.position!==void 0||Gi.normal!==void 0||Gi.color!==void 0)&&at.update(q,ne,mn),(Zt||nt.receiveShadow!==q.receiveShadow)&&(nt.receiveShadow=q.receiveShadow,It.setValue(F,"receiveShadow",q.receiveShadow)),re.isMeshGouraudMaterial&&re.envMap!==null&&(Qn.envMap.value=Ke,Qn.flipEnvMap.value=Ke.isCubeTexture&&Ke.isRenderTargetTexture===!1?-1:1),re.isMeshStandardMaterial&&re.envMap===null&&j.environment!==null&&(Qn.envMapIntensity.value=j.environmentIntensity),Zt&&(It.setValue(F,"toneMappingExposure",T.toneMappingExposure),nt.needsLights&&Da(Qn,Pi),Re&&re.fog===!0&&De.refreshFogUniforms(Qn,Re),De.refreshMaterialUniforms(Qn,re,V,ce,v.state.transmissionRenderTarget[b.id]),pc.upload(F,ba(nt),Qn,D)),re.isShaderMaterial&&re.uniformsNeedUpdate===!0&&(pc.upload(F,ba(nt),Qn,D),re.uniformsNeedUpdate=!1),re.isSpriteMaterial&&It.setValue(F,"center",q.center),It.setValue(F,"modelViewMatrix",q.modelViewMatrix),It.setValue(F,"normalMatrix",q.normalMatrix),It.setValue(F,"modelMatrix",q.matrixWorld),re.isShaderMaterial||re.isRawShaderMaterial){const wn=re.uniformsGroups;for(let Jn=0,Fn=wn.length;Jn<Fn;Jn++){const Na=wn[Jn];X.update(Na,mn),X.bind(Na,mn)}}return mn}function Da(b,j){b.ambientLightColor.needsUpdate=j,b.lightProbe.needsUpdate=j,b.directionalLights.needsUpdate=j,b.directionalLightShadows.needsUpdate=j,b.pointLights.needsUpdate=j,b.pointLightShadows.needsUpdate=j,b.spotLights.needsUpdate=j,b.spotLightShadows.needsUpdate=j,b.rectAreaLights.needsUpdate=j,b.hemisphereLights.needsUpdate=j}function wc(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(b,j,ne){Oe.get(b.texture).__webglTexture=j,Oe.get(b.depthTexture).__webglTexture=ne;const re=Oe.get(b);re.__hasExternalTextures=!0,re.__autoAllocateDepthBuffer=ne===void 0,re.__autoAllocateDepthBuffer||Ee.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),re.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,j){const ne=Oe.get(b);ne.__webglFramebuffer=j,ne.__useDefaultFramebuffer=j===void 0},this.setRenderTarget=function(b,j=0,ne=0){z=b,I=j,O=ne;let re=!0,q=null,Re=!1,Te=!1;if(b){const Ke=Oe.get(b);if(Ke.__useDefaultFramebuffer!==void 0)be.bindFramebuffer(F.FRAMEBUFFER,null),re=!1;else if(Ke.__webglFramebuffer===void 0)D.setupRenderTarget(b);else if(Ke.__hasExternalTextures)D.rebindTextures(b,Oe.get(b.texture).__webglTexture,Oe.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const et=b.depthTexture;if(Ke.__boundDepthTexture!==et){if(et!==null&&Oe.has(et)&&(b.width!==et.image.width||b.height!==et.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(b)}}const lt=b.texture;(lt.isData3DTexture||lt.isDataArrayTexture||lt.isCompressedArrayTexture)&&(Te=!0);const ut=Oe.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(ut[j])?q=ut[j][ne]:q=ut[j],Re=!0):b.samples>0&&D.useMultisampledRTT(b)===!1?q=Oe.get(b).__webglMultisampledFramebuffer:Array.isArray(ut)?q=ut[ne]:q=ut,U.copy(b.viewport),Q.copy(b.scissor),Y=b.scissorTest}else U.copy(k).multiplyScalar(V).floor(),Q.copy(ee).multiplyScalar(V).floor(),Y=Fe;if(be.bindFramebuffer(F.FRAMEBUFFER,q)&&re&&be.drawBuffers(b,q),be.viewport(U),be.scissor(Q),be.setScissorTest(Y),Re){const Ke=Oe.get(b.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ke.__webglTexture,ne)}else if(Te){const Ke=Oe.get(b.texture),lt=j||0;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,Ke.__webglTexture,ne||0,lt)}P=-1},this.readRenderTargetPixels=function(b,j,ne,re,q,Re,Te){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Je=Oe.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Te!==void 0&&(Je=Je[Te]),Je){be.bindFramebuffer(F.FRAMEBUFFER,Je);try{const Ke=b.texture,lt=Ke.format,ut=Ke.type;if(!Ve.textureFormatReadable(lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ve.textureTypeReadable(ut)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}j>=0&&j<=b.width-re&&ne>=0&&ne<=b.height-q&&F.readPixels(j,ne,re,q,ft.convert(lt),ft.convert(ut),Re)}finally{const Ke=z!==null?Oe.get(z).__webglFramebuffer:null;be.bindFramebuffer(F.FRAMEBUFFER,Ke)}}},this.readRenderTargetPixelsAsync=async function(b,j,ne,re,q,Re,Te){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Je=Oe.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Te!==void 0&&(Je=Je[Te]),Je){const Ke=b.texture,lt=Ke.format,ut=Ke.type;if(!Ve.textureFormatReadable(lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ve.textureTypeReadable(ut))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(j>=0&&j<=b.width-re&&ne>=0&&ne<=b.height-q){be.bindFramebuffer(F.FRAMEBUFFER,Je);const et=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,et),F.bufferData(F.PIXEL_PACK_BUFFER,Re.byteLength,F.STREAM_READ),F.readPixels(j,ne,re,q,ft.convert(lt),ft.convert(ut),0);const St=z!==null?Oe.get(z).__webglFramebuffer:null;be.bindFramebuffer(F.FRAMEBUFFER,St);const Pt=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await py(F,Pt,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,et),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,Re),F.deleteBuffer(et),F.deleteSync(Pt),Re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,j=null,ne=0){b.isTexture!==!0&&(ua("WebGLRenderer: copyFramebufferToTexture function signature has changed."),j=arguments[0]||null,b=arguments[1]);const re=Math.pow(2,-ne),q=Math.floor(b.image.width*re),Re=Math.floor(b.image.height*re),Te=j!==null?j.x:0,Je=j!==null?j.y:0;D.setTexture2D(b,0),F.copyTexSubImage2D(F.TEXTURE_2D,ne,0,0,Te,Je,q,Re),be.unbindTexture()},this.copyTextureToTexture=function(b,j,ne=null,re=null,q=0){b.isTexture!==!0&&(ua("WebGLRenderer: copyTextureToTexture function signature has changed."),re=arguments[0]||null,b=arguments[1],j=arguments[2],q=arguments[3]||0,ne=null);let Re,Te,Je,Ke,lt,ut,et,St,Pt;const yt=b.isCompressedTexture?b.mipmaps[q]:b.image;ne!==null?(Re=ne.max.x-ne.min.x,Te=ne.max.y-ne.min.y,Je=ne.isBox3?ne.max.z-ne.min.z:1,Ke=ne.min.x,lt=ne.min.y,ut=ne.isBox3?ne.min.z:0):(Re=yt.width,Te=yt.height,Je=yt.depth||1,Ke=0,lt=0,ut=0),re!==null?(et=re.x,St=re.y,Pt=re.z):(et=0,St=0,Pt=0);const pn=ft.convert(j.format),pt=ft.convert(j.type);let nt;j.isData3DTexture?(D.setTexture3D(j,0),nt=F.TEXTURE_3D):j.isDataArrayTexture||j.isCompressedArrayTexture?(D.setTexture2DArray(j,0),nt=F.TEXTURE_2D_ARRAY):(D.setTexture2D(j,0),nt=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,j.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,j.unpackAlignment);const ui=F.getParameter(F.UNPACK_ROW_LENGTH),Ct=F.getParameter(F.UNPACK_IMAGE_HEIGHT),mn=F.getParameter(F.UNPACK_SKIP_PIXELS),fi=F.getParameter(F.UNPACK_SKIP_ROWS),Zt=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,yt.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,yt.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Ke),F.pixelStorei(F.UNPACK_SKIP_ROWS,lt),F.pixelStorei(F.UNPACK_SKIP_IMAGES,ut);const Pi=b.isDataArrayTexture||b.isData3DTexture,It=j.isDataArrayTexture||j.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const Qn=Oe.get(b),Gi=Oe.get(j),wn=Oe.get(Qn.__renderTarget),Jn=Oe.get(Gi.__renderTarget);be.bindFramebuffer(F.READ_FRAMEBUFFER,wn.__webglFramebuffer),be.bindFramebuffer(F.DRAW_FRAMEBUFFER,Jn.__webglFramebuffer);for(let Fn=0;Fn<Je;Fn++)Pi&&F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Oe.get(b).__webglTexture,q,ut+Fn),b.isDepthTexture?(It&&F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Oe.get(j).__webglTexture,q,Pt+Fn),F.blitFramebuffer(Ke,lt,Re,Te,et,St,Re,Te,F.DEPTH_BUFFER_BIT,F.NEAREST)):It?F.copyTexSubImage3D(nt,q,et,St,Pt+Fn,Ke,lt,Re,Te):F.copyTexSubImage2D(nt,q,et,St,Pt+Fn,Ke,lt,Re,Te);be.bindFramebuffer(F.READ_FRAMEBUFFER,null),be.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else It?b.isDataTexture||b.isData3DTexture?F.texSubImage3D(nt,q,et,St,Pt,Re,Te,Je,pn,pt,yt.data):j.isCompressedArrayTexture?F.compressedTexSubImage3D(nt,q,et,St,Pt,Re,Te,Je,pn,yt.data):F.texSubImage3D(nt,q,et,St,Pt,Re,Te,Je,pn,pt,yt):b.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,q,et,St,Re,Te,pn,pt,yt.data):b.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,q,et,St,yt.width,yt.height,pn,yt.data):F.texSubImage2D(F.TEXTURE_2D,q,et,St,Re,Te,pn,pt,yt);F.pixelStorei(F.UNPACK_ROW_LENGTH,ui),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Ct),F.pixelStorei(F.UNPACK_SKIP_PIXELS,mn),F.pixelStorei(F.UNPACK_SKIP_ROWS,fi),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Zt),q===0&&j.generateMipmaps&&F.generateMipmap(nt),be.unbindTexture()},this.copyTextureToTexture3D=function(b,j,ne=null,re=null,q=0){return b.isTexture!==!0&&(ua("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ne=arguments[0]||null,re=arguments[1]||null,b=arguments[2],j=arguments[3],q=arguments[4]||0),ua('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,j,ne,re,q)},this.initRenderTarget=function(b){Oe.get(b).__webglFramebuffer===void 0&&D.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?D.setTextureCube(b,0):b.isData3DTexture?D.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?D.setTexture2DArray(b,0):D.setTexture2D(b,0),be.unbindTexture()},this.resetState=function(){I=0,O=0,z=null,be.reset(),bt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ar}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=At._getDrawingBufferColorSpace(e),t.unpackColorSpace=At._getUnpackColorSpace()}}class id{constructor(e,t=1,s=1e3){this.isFog=!0,this.name="",this.color=new Mt(e),this.near=t,this.far=s}clone(){return new id(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class C1 extends dn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ci,this.environmentIntensity=1,this.environmentRotation=new Ci,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Ra extends Nn{constructor(e,t,s,o,l,c,f,h,d){super(e,t,s,o,l,c,f,h,d),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Bi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const s=this.getUtoTmapping(e);return this.getPoint(s,t)}getPoints(e=5){const t=[];for(let s=0;s<=e;s++)t.push(this.getPoint(s/e));return t}getSpacedPoints(e=5){const t=[];for(let s=0;s<=e;s++)t.push(this.getPointAt(s/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let s,o=this.getPoint(0),l=0;t.push(0);for(let c=1;c<=e;c++)s=this.getPoint(c/e),l+=s.distanceTo(o),t.push(l),o=s;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const s=this.getLengths();let o=0;const l=s.length;let c;t?c=t:c=e*s[l-1];let f=0,h=l-1,d;for(;f<=h;)if(o=Math.floor(f+(h-f)/2),d=s[o]-c,d<0)f=o+1;else if(d>0)h=o-1;else{h=o;break}if(o=h,s[o]===c)return o/(l-1);const m=s[o],g=s[o+1]-m,y=(c-m)/g;return(o+y)/(l-1)}getTangent(e,t){let o=e-1e-4,l=e+1e-4;o<0&&(o=0),l>1&&(l=1);const c=this.getPoint(o),f=this.getPoint(l),h=t||(c.isVector2?new ze:new G);return h.copy(f).sub(c).normalize(),h}getTangentAt(e,t){const s=this.getUtoTmapping(e);return this.getTangent(s,t)}computeFrenetFrames(e,t){const s=new G,o=[],l=[],c=[],f=new G,h=new Gt;for(let y=0;y<=e;y++){const M=y/e;o[y]=this.getTangentAt(M,new G)}l[0]=new G,c[0]=new G;let d=Number.MAX_VALUE;const m=Math.abs(o[0].x),_=Math.abs(o[0].y),g=Math.abs(o[0].z);m<=d&&(d=m,s.set(1,0,0)),_<=d&&(d=_,s.set(0,1,0)),g<=d&&s.set(0,0,1),f.crossVectors(o[0],s).normalize(),l[0].crossVectors(o[0],f),c[0].crossVectors(o[0],l[0]);for(let y=1;y<=e;y++){if(l[y]=l[y-1].clone(),c[y]=c[y-1].clone(),f.crossVectors(o[y-1],o[y]),f.length()>Number.EPSILON){f.normalize();const M=Math.acos(hn(o[y-1].dot(o[y]),-1,1));l[y].applyMatrix4(h.makeRotationAxis(f,M))}c[y].crossVectors(o[y],l[y])}if(t===!0){let y=Math.acos(hn(l[0].dot(l[e]),-1,1));y/=e,o[0].dot(f.crossVectors(l[0],l[e]))>0&&(y=-y);for(let M=1;M<=e;M++)l[M].applyMatrix4(h.makeRotationAxis(o[M],y*M)),c[M].crossVectors(o[M],l[M])}return{tangents:o,normals:l,binormals:c}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class rd extends Bi{constructor(e=0,t=0,s=1,o=1,l=0,c=Math.PI*2,f=!1,h=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=s,this.yRadius=o,this.aStartAngle=l,this.aEndAngle=c,this.aClockwise=f,this.aRotation=h}getPoint(e,t=new ze){const s=t,o=Math.PI*2;let l=this.aEndAngle-this.aStartAngle;const c=Math.abs(l)<Number.EPSILON;for(;l<0;)l+=o;for(;l>o;)l-=o;l<Number.EPSILON&&(c?l=0:l=o),this.aClockwise===!0&&!c&&(l===o?l=-o:l=l-o);const f=this.aStartAngle+e*l;let h=this.aX+this.xRadius*Math.cos(f),d=this.aY+this.yRadius*Math.sin(f);if(this.aRotation!==0){const m=Math.cos(this.aRotation),_=Math.sin(this.aRotation),g=h-this.aX,y=d-this.aY;h=g*m-y*_+this.aX,d=g*_+y*m+this.aY}return s.set(h,d)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class R1 extends rd{constructor(e,t,s,o,l,c){super(e,t,s,s,o,l,c),this.isArcCurve=!0,this.type="ArcCurve"}}function sd(){let i=0,e=0,t=0,s=0;function o(l,c,f,h){i=l,e=f,t=-3*l+3*c-2*f-h,s=2*l-2*c+f+h}return{initCatmullRom:function(l,c,f,h,d){o(c,f,d*(f-l),d*(h-c))},initNonuniformCatmullRom:function(l,c,f,h,d,m,_){let g=(c-l)/d-(f-l)/(d+m)+(f-c)/m,y=(f-c)/m-(h-c)/(m+_)+(h-f)/_;g*=m,y*=m,o(c,f,g,y)},calc:function(l){const c=l*l,f=c*l;return i+e*l+t*c+s*f}}}const nc=new G,Ff=new sd,Of=new sd,kf=new sd;class P1 extends Bi{constructor(e=[],t=!1,s="centripetal",o=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=s,this.tension=o}getPoint(e,t=new G){const s=t,o=this.points,l=o.length,c=(l-(this.closed?0:1))*e;let f=Math.floor(c),h=c-f;this.closed?f+=f>0?0:(Math.floor(Math.abs(f)/l)+1)*l:h===0&&f===l-1&&(f=l-2,h=1);let d,m;this.closed||f>0?d=o[(f-1)%l]:(nc.subVectors(o[0],o[1]).add(o[0]),d=nc);const _=o[f%l],g=o[(f+1)%l];if(this.closed||f+2<l?m=o[(f+2)%l]:(nc.subVectors(o[l-1],o[l-2]).add(o[l-1]),m=nc),this.curveType==="centripetal"||this.curveType==="chordal"){const y=this.curveType==="chordal"?.5:.25;let M=Math.pow(d.distanceToSquared(_),y),E=Math.pow(_.distanceToSquared(g),y),S=Math.pow(g.distanceToSquared(m),y);E<1e-4&&(E=1),M<1e-4&&(M=E),S<1e-4&&(S=E),Ff.initNonuniformCatmullRom(d.x,_.x,g.x,m.x,M,E,S),Of.initNonuniformCatmullRom(d.y,_.y,g.y,m.y,M,E,S),kf.initNonuniformCatmullRom(d.z,_.z,g.z,m.z,M,E,S)}else this.curveType==="catmullrom"&&(Ff.initCatmullRom(d.x,_.x,g.x,m.x,this.tension),Of.initCatmullRom(d.y,_.y,g.y,m.y,this.tension),kf.initCatmullRom(d.z,_.z,g.z,m.z,this.tension));return s.set(Ff.calc(h),Of.calc(h),kf.calc(h)),s}copy(e){super.copy(e),this.points=[];for(let t=0,s=e.points.length;t<s;t++){const o=e.points[t];this.points.push(o.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,s=this.points.length;t<s;t++){const o=this.points[t];e.points.push(o.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,s=e.points.length;t<s;t++){const o=e.points[t];this.points.push(new G().fromArray(o))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Hg(i,e,t,s,o){const l=(s-e)*.5,c=(o-t)*.5,f=i*i,h=i*f;return(2*t-2*s+l+c)*h+(-3*t+3*s-2*l-c)*f+l*i+t}function b1(i,e){const t=1-i;return t*t*e}function L1(i,e){return 2*(1-i)*i*e}function D1(i,e){return i*i*e}function pa(i,e,t,s){return b1(i,e)+L1(i,t)+D1(i,s)}function N1(i,e){const t=1-i;return t*t*t*e}function I1(i,e){const t=1-i;return 3*t*t*i*e}function U1(i,e){return 3*(1-i)*i*i*e}function F1(i,e){return i*i*i*e}function ma(i,e,t,s,o){return N1(i,e)+I1(i,t)+U1(i,s)+F1(i,o)}class $0 extends Bi{constructor(e=new ze,t=new ze,s=new ze,o=new ze){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=s,this.v3=o}getPoint(e,t=new ze){const s=t,o=this.v0,l=this.v1,c=this.v2,f=this.v3;return s.set(ma(e,o.x,l.x,c.x,f.x),ma(e,o.y,l.y,c.y,f.y)),s}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class O1 extends Bi{constructor(e=new G,t=new G,s=new G,o=new G){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=s,this.v3=o}getPoint(e,t=new G){const s=t,o=this.v0,l=this.v1,c=this.v2,f=this.v3;return s.set(ma(e,o.x,l.x,c.x,f.x),ma(e,o.y,l.y,c.y,f.y),ma(e,o.z,l.z,c.z,f.z)),s}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Z0 extends Bi{constructor(e=new ze,t=new ze){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ze){const s=t;return e===1?s.copy(this.v2):(s.copy(this.v2).sub(this.v1),s.multiplyScalar(e).add(this.v1)),s}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ze){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class k1 extends Bi{constructor(e=new G,t=new G){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new G){const s=t;return e===1?s.copy(this.v2):(s.copy(this.v2).sub(this.v1),s.multiplyScalar(e).add(this.v1)),s}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new G){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Q0 extends Bi{constructor(e=new ze,t=new ze,s=new ze){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=s}getPoint(e,t=new ze){const s=t,o=this.v0,l=this.v1,c=this.v2;return s.set(pa(e,o.x,l.x,c.x),pa(e,o.y,l.y,c.y)),s}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class z1 extends Bi{constructor(e=new G,t=new G,s=new G){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=s}getPoint(e,t=new G){const s=t,o=this.v0,l=this.v1,c=this.v2;return s.set(pa(e,o.x,l.x,c.x),pa(e,o.y,l.y,c.y),pa(e,o.z,l.z,c.z)),s}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class J0 extends Bi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ze){const s=t,o=this.points,l=(o.length-1)*e,c=Math.floor(l),f=l-c,h=o[c===0?c:c-1],d=o[c],m=o[c>o.length-2?o.length-1:c+1],_=o[c>o.length-3?o.length-1:c+2];return s.set(Hg(f,h.x,d.x,m.x,_.x),Hg(f,h.y,d.y,m.y,_.y)),s}copy(e){super.copy(e),this.points=[];for(let t=0,s=e.points.length;t<s;t++){const o=e.points[t];this.points.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,s=this.points.length;t<s;t++){const o=this.points[t];e.points.push(o.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,s=e.points.length;t<s;t++){const o=e.points[t];this.points.push(new ze().fromArray(o))}return this}}var Uh=Object.freeze({__proto__:null,ArcCurve:R1,CatmullRomCurve3:P1,CubicBezierCurve:$0,CubicBezierCurve3:O1,EllipseCurve:rd,LineCurve:Z0,LineCurve3:k1,QuadraticBezierCurve:Q0,QuadraticBezierCurve3:z1,SplineCurve:J0});class B1 extends Bi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const s=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Uh[s](t,e))}return this}getPoint(e,t){const s=e*this.getLength(),o=this.getCurveLengths();let l=0;for(;l<o.length;){if(o[l]>=s){const c=o[l]-s,f=this.curves[l],h=f.getLength(),d=h===0?0:1-c/h;return f.getPointAt(d,t)}l++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let s=0,o=this.curves.length;s<o;s++)t+=this.curves[s].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let s=0;s<=e;s++)t.push(this.getPoint(s/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let s;for(let o=0,l=this.curves;o<l.length;o++){const c=l[o],f=c.isEllipseCurve?e*2:c.isLineCurve||c.isLineCurve3?1:c.isSplineCurve?e*c.points.length:e,h=c.getPoints(f);for(let d=0;d<h.length;d++){const m=h[d];s&&s.equals(m)||(t.push(m),s=m)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,s=e.curves.length;t<s;t++){const o=e.curves[t];this.curves.push(o.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,s=this.curves.length;t<s;t++){const o=this.curves[t];e.curves.push(o.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,s=e.curves.length;t<s;t++){const o=e.curves[t];this.curves.push(new Uh[o.type]().fromJSON(o))}return this}}class Vg extends B1{constructor(e){super(),this.type="Path",this.currentPoint=new ze,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,s=e.length;t<s;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const s=new Z0(this.currentPoint.clone(),new ze(e,t));return this.curves.push(s),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,s,o){const l=new Q0(this.currentPoint.clone(),new ze(e,t),new ze(s,o));return this.curves.push(l),this.currentPoint.set(s,o),this}bezierCurveTo(e,t,s,o,l,c){const f=new $0(this.currentPoint.clone(),new ze(e,t),new ze(s,o),new ze(l,c));return this.curves.push(f),this.currentPoint.set(l,c),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),s=new J0(t);return this.curves.push(s),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,s,o,l,c){const f=this.currentPoint.x,h=this.currentPoint.y;return this.absarc(e+f,t+h,s,o,l,c),this}absarc(e,t,s,o,l,c){return this.absellipse(e,t,s,s,o,l,c),this}ellipse(e,t,s,o,l,c,f,h){const d=this.currentPoint.x,m=this.currentPoint.y;return this.absellipse(e+d,t+m,s,o,l,c,f,h),this}absellipse(e,t,s,o,l,c,f,h){const d=new rd(e,t,s,o,l,c,f,h);if(this.curves.length>0){const _=d.getPoint(0);_.equals(this.currentPoint)||this.lineTo(_.x,_.y)}this.curves.push(d);const m=d.getPoint(1);return this.currentPoint.copy(m),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ei extends zi{constructor(e=1,t=1,s=1,o=32,l=1,c=!1,f=0,h=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:s,radialSegments:o,heightSegments:l,openEnded:c,thetaStart:f,thetaLength:h};const d=this;o=Math.floor(o),l=Math.floor(l);const m=[],_=[],g=[],y=[];let M=0;const E=[],S=s/2;let v=0;L(),c===!1&&(e>0&&R(!0),t>0&&R(!1)),this.setIndex(m),this.setAttribute("position",new In(_,3)),this.setAttribute("normal",new In(g,3)),this.setAttribute("uv",new In(y,2));function L(){const T=new G,B=new G;let I=0;const O=(t-e)/s;for(let z=0;z<=l;z++){const P=[],A=z/l,U=A*(t-e)+e;for(let Q=0;Q<=o;Q++){const Y=Q/o,ie=Y*h+f,le=Math.sin(ie),se=Math.cos(ie);B.x=U*le,B.y=-A*s+S,B.z=U*se,_.push(B.x,B.y,B.z),T.set(le,O,se).normalize(),g.push(T.x,T.y,T.z),y.push(Y,1-A),P.push(M++)}E.push(P)}for(let z=0;z<o;z++)for(let P=0;P<l;P++){const A=E[P][z],U=E[P+1][z],Q=E[P+1][z+1],Y=E[P][z+1];(e>0||P!==0)&&(m.push(A,U,Y),I+=3),(t>0||P!==l-1)&&(m.push(U,Q,Y),I+=3)}d.addGroup(v,I,0),v+=I}function R(T){const B=M,I=new ze,O=new G;let z=0;const P=T===!0?e:t,A=T===!0?1:-1;for(let Q=1;Q<=o;Q++)_.push(0,S*A,0),g.push(0,A,0),y.push(.5,.5),M++;const U=M;for(let Q=0;Q<=o;Q++){const ie=Q/o*h+f,le=Math.cos(ie),se=Math.sin(ie);O.x=P*se,O.y=S*A,O.z=P*le,_.push(O.x,O.y,O.z),g.push(0,A,0),I.x=le*.5+.5,I.y=se*.5*A+.5,y.push(I.x,I.y),M++}for(let Q=0;Q<o;Q++){const Y=B+Q,ie=U+Q;T===!0?m.push(ie,ie+1,Y):m.push(ie+1,ie,Y),z+=3}d.addGroup(v,z,T===!0?1:2),v+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ei(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class od extends Ei{constructor(e=1,t=1,s=32,o=1,l=!1,c=0,f=Math.PI*2){super(0,e,t,s,o,l,c,f),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:s,heightSegments:o,openEnded:l,thetaStart:c,thetaLength:f}}static fromJSON(e){return new od(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ev extends Vg{constructor(e){super(e),this.uuid=ys(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let s=0,o=this.holes.length;s<o;s++)t[s]=this.holes[s].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,s=e.holes.length;t<s;t++){const o=e.holes[t];this.holes.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,s=this.holes.length;t<s;t++){const o=this.holes[t];e.holes.push(o.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,s=e.holes.length;t<s;t++){const o=e.holes[t];this.holes.push(new Vg().fromJSON(o))}return this}}const H1={triangulate:function(i,e,t=2){const s=e&&e.length,o=s?e[0]*t:i.length;let l=tv(i,0,o,t,!0);const c=[];if(!l||l.next===l.prev)return c;let f,h,d,m,_,g,y;if(s&&(l=j1(i,e,l,t)),i.length>80*t){f=d=i[0],h=m=i[1];for(let M=t;M<o;M+=t)_=i[M],g=i[M+1],_<f&&(f=_),g<h&&(h=g),_>d&&(d=_),g>m&&(m=g);y=Math.max(d-f,m-h),y=y!==0?32767/y:0}return Ma(l,c,t,f,h,y,0),c}};function tv(i,e,t,s,o){let l,c;if(o===iT(i,e,t,s)>0)for(l=e;l<t;l+=s)c=Gg(l,i[l],i[l+1],c);else for(l=t-s;l>=e;l-=s)c=Gg(l,i[l],i[l+1],c);return c&&Sc(c,c.next)&&(wa(c),c=c.next),c}function xs(i,e){if(!i)return i;e||(e=i);let t=i,s;do if(s=!1,!t.steiner&&(Sc(t,t.next)||Vt(t.prev,t,t.next)===0)){if(wa(t),t=e=t.prev,t===t.next)break;s=!0}else t=t.next;while(s||t!==e);return e}function Ma(i,e,t,s,o,l,c){if(!i)return;!c&&l&&Z1(i,s,o,l);let f=i,h,d;for(;i.prev!==i.next;){if(h=i.prev,d=i.next,l?G1(i,s,o,l):V1(i)){e.push(h.i/t|0),e.push(i.i/t|0),e.push(d.i/t|0),wa(i),i=d.next,f=d.next;continue}if(i=d,i===f){c?c===1?(i=W1(xs(i),e,t),Ma(i,e,t,s,o,l,2)):c===2&&X1(i,e,t,s,o,l):Ma(xs(i),e,t,s,o,l,1);break}}}function V1(i){const e=i.prev,t=i,s=i.next;if(Vt(e,t,s)>=0)return!1;const o=e.x,l=t.x,c=s.x,f=e.y,h=t.y,d=s.y,m=o<l?o<c?o:c:l<c?l:c,_=f<h?f<d?f:d:h<d?h:d,g=o>l?o>c?o:c:l>c?l:c,y=f>h?f>d?f:d:h>d?h:d;let M=s.next;for(;M!==e;){if(M.x>=m&&M.x<=g&&M.y>=_&&M.y<=y&&uo(o,f,l,h,c,d,M.x,M.y)&&Vt(M.prev,M,M.next)>=0)return!1;M=M.next}return!0}function G1(i,e,t,s){const o=i.prev,l=i,c=i.next;if(Vt(o,l,c)>=0)return!1;const f=o.x,h=l.x,d=c.x,m=o.y,_=l.y,g=c.y,y=f<h?f<d?f:d:h<d?h:d,M=m<_?m<g?m:g:_<g?_:g,E=f>h?f>d?f:d:h>d?h:d,S=m>_?m>g?m:g:_>g?_:g,v=Fh(y,M,e,t,s),L=Fh(E,S,e,t,s);let R=i.prevZ,T=i.nextZ;for(;R&&R.z>=v&&T&&T.z<=L;){if(R.x>=y&&R.x<=E&&R.y>=M&&R.y<=S&&R!==o&&R!==c&&uo(f,m,h,_,d,g,R.x,R.y)&&Vt(R.prev,R,R.next)>=0||(R=R.prevZ,T.x>=y&&T.x<=E&&T.y>=M&&T.y<=S&&T!==o&&T!==c&&uo(f,m,h,_,d,g,T.x,T.y)&&Vt(T.prev,T,T.next)>=0))return!1;T=T.nextZ}for(;R&&R.z>=v;){if(R.x>=y&&R.x<=E&&R.y>=M&&R.y<=S&&R!==o&&R!==c&&uo(f,m,h,_,d,g,R.x,R.y)&&Vt(R.prev,R,R.next)>=0)return!1;R=R.prevZ}for(;T&&T.z<=L;){if(T.x>=y&&T.x<=E&&T.y>=M&&T.y<=S&&T!==o&&T!==c&&uo(f,m,h,_,d,g,T.x,T.y)&&Vt(T.prev,T,T.next)>=0)return!1;T=T.nextZ}return!0}function W1(i,e,t){let s=i;do{const o=s.prev,l=s.next.next;!Sc(o,l)&&nv(o,s,s.next,l)&&Ea(o,l)&&Ea(l,o)&&(e.push(o.i/t|0),e.push(s.i/t|0),e.push(l.i/t|0),wa(s),wa(s.next),s=i=l),s=s.next}while(s!==i);return xs(s)}function X1(i,e,t,s,o,l){let c=i;do{let f=c.next.next;for(;f!==c.prev;){if(c.i!==f.i&&eT(c,f)){let h=iv(c,f);c=xs(c,c.next),h=xs(h,h.next),Ma(c,e,t,s,o,l,0),Ma(h,e,t,s,o,l,0);return}f=f.next}c=c.next}while(c!==i)}function j1(i,e,t,s){const o=[];let l,c,f,h,d;for(l=0,c=e.length;l<c;l++)f=e[l]*s,h=l<c-1?e[l+1]*s:i.length,d=tv(i,f,h,s,!1),d===d.next&&(d.steiner=!0),o.push(J1(d));for(o.sort(q1),l=0;l<o.length;l++)t=Y1(o[l],t);return t}function q1(i,e){return i.x-e.x}function Y1(i,e){const t=K1(i,e);if(!t)return e;const s=iv(t,i);return xs(s,s.next),xs(t,t.next)}function K1(i,e){let t=e,s=-1/0,o;const l=i.x,c=i.y;do{if(c<=t.y&&c>=t.next.y&&t.next.y!==t.y){const g=t.x+(c-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(g<=l&&g>s&&(s=g,o=t.x<t.next.x?t:t.next,g===l))return o}t=t.next}while(t!==e);if(!o)return null;const f=o,h=o.x,d=o.y;let m=1/0,_;t=o;do l>=t.x&&t.x>=h&&l!==t.x&&uo(c<d?l:s,c,h,d,c<d?s:l,c,t.x,t.y)&&(_=Math.abs(c-t.y)/(l-t.x),Ea(t,i)&&(_<m||_===m&&(t.x>o.x||t.x===o.x&&$1(o,t)))&&(o=t,m=_)),t=t.next;while(t!==f);return o}function $1(i,e){return Vt(i.prev,i,e.prev)<0&&Vt(e.next,i,i.next)<0}function Z1(i,e,t,s){let o=i;do o.z===0&&(o.z=Fh(o.x,o.y,e,t,s)),o.prevZ=o.prev,o.nextZ=o.next,o=o.next;while(o!==i);o.prevZ.nextZ=null,o.prevZ=null,Q1(o)}function Q1(i){let e,t,s,o,l,c,f,h,d=1;do{for(t=i,i=null,l=null,c=0;t;){for(c++,s=t,f=0,e=0;e<d&&(f++,s=s.nextZ,!!s);e++);for(h=d;f>0||h>0&&s;)f!==0&&(h===0||!s||t.z<=s.z)?(o=t,t=t.nextZ,f--):(o=s,s=s.nextZ,h--),l?l.nextZ=o:i=o,o.prevZ=l,l=o;t=s}l.nextZ=null,d*=2}while(c>1);return i}function Fh(i,e,t,s,o){return i=(i-t)*o|0,e=(e-s)*o|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function J1(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function uo(i,e,t,s,o,l,c,f){return(o-c)*(e-f)>=(i-c)*(l-f)&&(i-c)*(s-f)>=(t-c)*(e-f)&&(t-c)*(l-f)>=(o-c)*(s-f)}function eT(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!tT(i,e)&&(Ea(i,e)&&Ea(e,i)&&nT(i,e)&&(Vt(i.prev,i,e.prev)||Vt(i,e.prev,e))||Sc(i,e)&&Vt(i.prev,i,i.next)>0&&Vt(e.prev,e,e.next)>0)}function Vt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Sc(i,e){return i.x===e.x&&i.y===e.y}function nv(i,e,t,s){const o=rc(Vt(i,e,t)),l=rc(Vt(i,e,s)),c=rc(Vt(t,s,i)),f=rc(Vt(t,s,e));return!!(o!==l&&c!==f||o===0&&ic(i,t,e)||l===0&&ic(i,s,e)||c===0&&ic(t,i,s)||f===0&&ic(t,e,s))}function ic(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function rc(i){return i>0?1:i<0?-1:0}function tT(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&nv(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Ea(i,e){return Vt(i.prev,i,i.next)<0?Vt(i,e,i.next)>=0&&Vt(i,i.prev,e)>=0:Vt(i,e,i.prev)<0||Vt(i,i.next,e)<0}function nT(i,e){let t=i,s=!1;const o=(i.x+e.x)/2,l=(i.y+e.y)/2;do t.y>l!=t.next.y>l&&t.next.y!==t.y&&o<(t.next.x-t.x)*(l-t.y)/(t.next.y-t.y)+t.x&&(s=!s),t=t.next;while(t!==i);return s}function iv(i,e){const t=new Oh(i.i,i.x,i.y),s=new Oh(e.i,e.x,e.y),o=i.next,l=e.prev;return i.next=e,e.prev=i,t.next=o,o.prev=t,s.next=t,t.prev=s,l.next=s,s.prev=l,s}function Gg(i,e,t,s){const o=new Oh(i,e,t);return s?(o.next=s.next,o.prev=s,s.next.prev=o,s.next=o):(o.prev=o,o.next=o),o}function wa(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Oh(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function iT(i,e,t,s){let o=0;for(let l=e,c=t-s;l<t;l+=s)o+=(i[c]-i[l])*(i[l+1]+i[c+1]),c=l;return o}class ga{static area(e){const t=e.length;let s=0;for(let o=t-1,l=0;l<t;o=l++)s+=e[o].x*e[l].y-e[l].x*e[o].y;return s*.5}static isClockWise(e){return ga.area(e)<0}static triangulateShape(e,t){const s=[],o=[],l=[];Wg(e),Xg(s,e);let c=e.length;t.forEach(Wg);for(let h=0;h<t.length;h++)o.push(c),c+=t[h].length,Xg(s,t[h]);const f=H1.triangulate(s,o);for(let h=0;h<f.length;h+=3)l.push(f.slice(h,h+3));return l}}function Wg(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Xg(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class ad extends zi{constructor(e=new ev([new ze(.5,.5),new ze(-.5,.5),new ze(-.5,-.5),new ze(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const s=this,o=[],l=[];for(let f=0,h=e.length;f<h;f++){const d=e[f];c(d)}this.setAttribute("position",new In(o,3)),this.setAttribute("uv",new In(l,2)),this.computeVertexNormals();function c(f){const h=[],d=t.curveSegments!==void 0?t.curveSegments:12,m=t.steps!==void 0?t.steps:1,_=t.depth!==void 0?t.depth:1;let g=t.bevelEnabled!==void 0?t.bevelEnabled:!0,y=t.bevelThickness!==void 0?t.bevelThickness:.2,M=t.bevelSize!==void 0?t.bevelSize:y-.1,E=t.bevelOffset!==void 0?t.bevelOffset:0,S=t.bevelSegments!==void 0?t.bevelSegments:3;const v=t.extrudePath,L=t.UVGenerator!==void 0?t.UVGenerator:rT;let R,T=!1,B,I,O,z;v&&(R=v.getSpacedPoints(m),T=!0,g=!1,B=v.computeFrenetFrames(m,!1),I=new G,O=new G,z=new G),g||(S=0,y=0,M=0,E=0);const P=f.extractPoints(d);let A=P.shape;const U=P.holes;if(!ga.isClockWise(A)){A=A.reverse();for(let ve=0,Ae=U.length;ve<Ae;ve++){const F=U[ve];ga.isClockWise(F)&&(U[ve]=F.reverse())}}const Y=ga.triangulateShape(A,U),ie=A;for(let ve=0,Ae=U.length;ve<Ae;ve++){const F=U[ve];A=A.concat(F)}function le(ve,Ae,F){return Ae||console.error("THREE.ExtrudeGeometry: vec does not exist"),ve.clone().addScaledVector(Ae,F)}const se=A.length,ce=Y.length;function V(ve,Ae,F){let Qe,Ee,Ve;const be=ve.x-Ae.x,it=ve.y-Ae.y,Oe=F.x-ve.x,D=F.y-ve.y,C=be*be+it*it,$=be*D-it*Oe;if(Math.abs($)>Number.EPSILON){const pe=Math.sqrt(C),_e=Math.sqrt(Oe*Oe+D*D),me=Ae.x-it/pe,Ye=Ae.y+be/pe,De=F.x-D/_e,Ge=F.y+Oe/_e,dt=((De-me)*D-(Ge-Ye)*Oe)/(be*D-it*Oe);Qe=me+be*dt-ve.x,Ee=Ye+it*dt-ve.y;const we=Qe*Qe+Ee*Ee;if(we<=2)return new ze(Qe,Ee);Ve=Math.sqrt(we/2)}else{let pe=!1;be>Number.EPSILON?Oe>Number.EPSILON&&(pe=!0):be<-Number.EPSILON?Oe<-Number.EPSILON&&(pe=!0):Math.sign(it)===Math.sign(D)&&(pe=!0),pe?(Qe=-it,Ee=be,Ve=Math.sqrt(C)):(Qe=be,Ee=it,Ve=Math.sqrt(C/2))}return new ze(Qe/Ve,Ee/Ve)}const ue=[];for(let ve=0,Ae=ie.length,F=Ae-1,Qe=ve+1;ve<Ae;ve++,F++,Qe++)F===Ae&&(F=0),Qe===Ae&&(Qe=0),ue[ve]=V(ie[ve],ie[F],ie[Qe]);const oe=[];let k,ee=ue.concat();for(let ve=0,Ae=U.length;ve<Ae;ve++){const F=U[ve];k=[];for(let Qe=0,Ee=F.length,Ve=Ee-1,be=Qe+1;Qe<Ee;Qe++,Ve++,be++)Ve===Ee&&(Ve=0),be===Ee&&(be=0),k[Qe]=V(F[Qe],F[Ve],F[be]);oe.push(k),ee=ee.concat(k)}for(let ve=0;ve<S;ve++){const Ae=ve/S,F=y*Math.cos(Ae*Math.PI/2),Qe=M*Math.sin(Ae*Math.PI/2)+E;for(let Ee=0,Ve=ie.length;Ee<Ve;Ee++){const be=le(ie[Ee],ue[Ee],Qe);de(be.x,be.y,-F)}for(let Ee=0,Ve=U.length;Ee<Ve;Ee++){const be=U[Ee];k=oe[Ee];for(let it=0,Oe=be.length;it<Oe;it++){const D=le(be[it],k[it],Qe);de(D.x,D.y,-F)}}}const Fe=M+E;for(let ve=0;ve<se;ve++){const Ae=g?le(A[ve],ee[ve],Fe):A[ve];T?(O.copy(B.normals[0]).multiplyScalar(Ae.x),I.copy(B.binormals[0]).multiplyScalar(Ae.y),z.copy(R[0]).add(O).add(I),de(z.x,z.y,z.z)):de(Ae.x,Ae.y,0)}for(let ve=1;ve<=m;ve++)for(let Ae=0;Ae<se;Ae++){const F=g?le(A[Ae],ee[Ae],Fe):A[Ae];T?(O.copy(B.normals[ve]).multiplyScalar(F.x),I.copy(B.binormals[ve]).multiplyScalar(F.y),z.copy(R[ve]).add(O).add(I),de(z.x,z.y,z.z)):de(F.x,F.y,_/m*ve)}for(let ve=S-1;ve>=0;ve--){const Ae=ve/S,F=y*Math.cos(Ae*Math.PI/2),Qe=M*Math.sin(Ae*Math.PI/2)+E;for(let Ee=0,Ve=ie.length;Ee<Ve;Ee++){const be=le(ie[Ee],ue[Ee],Qe);de(be.x,be.y,_+F)}for(let Ee=0,Ve=U.length;Ee<Ve;Ee++){const be=U[Ee];k=oe[Ee];for(let it=0,Oe=be.length;it<Oe;it++){const D=le(be[it],k[it],Qe);T?de(D.x,D.y+R[m-1].y,R[m-1].x+F):de(D.x,D.y,_+F)}}}J(),he();function J(){const ve=o.length/3;if(g){let Ae=0,F=se*Ae;for(let Qe=0;Qe<ce;Qe++){const Ee=Y[Qe];Pe(Ee[2]+F,Ee[1]+F,Ee[0]+F)}Ae=m+S*2,F=se*Ae;for(let Qe=0;Qe<ce;Qe++){const Ee=Y[Qe];Pe(Ee[0]+F,Ee[1]+F,Ee[2]+F)}}else{for(let Ae=0;Ae<ce;Ae++){const F=Y[Ae];Pe(F[2],F[1],F[0])}for(let Ae=0;Ae<ce;Ae++){const F=Y[Ae];Pe(F[0]+se*m,F[1]+se*m,F[2]+se*m)}}s.addGroup(ve,o.length/3-ve,0)}function he(){const ve=o.length/3;let Ae=0;Me(ie,Ae),Ae+=ie.length;for(let F=0,Qe=U.length;F<Qe;F++){const Ee=U[F];Me(Ee,Ae),Ae+=Ee.length}s.addGroup(ve,o.length/3-ve,1)}function Me(ve,Ae){let F=ve.length;for(;--F>=0;){const Qe=F;let Ee=F-1;Ee<0&&(Ee=ve.length-1);for(let Ve=0,be=m+S*2;Ve<be;Ve++){const it=se*Ve,Oe=se*(Ve+1),D=Ae+Qe+it,C=Ae+Ee+it,$=Ae+Ee+Oe,pe=Ae+Qe+Oe;He(D,C,$,pe)}}}function de(ve,Ae,F){h.push(ve),h.push(Ae),h.push(F)}function Pe(ve,Ae,F){Ze(ve),Ze(Ae),Ze(F);const Qe=o.length/3,Ee=L.generateTopUV(s,o,Qe-3,Qe-2,Qe-1);vt(Ee[0]),vt(Ee[1]),vt(Ee[2])}function He(ve,Ae,F,Qe){Ze(ve),Ze(Ae),Ze(Qe),Ze(Ae),Ze(F),Ze(Qe);const Ee=o.length/3,Ve=L.generateSideWallUV(s,o,Ee-6,Ee-3,Ee-2,Ee-1);vt(Ve[0]),vt(Ve[1]),vt(Ve[3]),vt(Ve[1]),vt(Ve[2]),vt(Ve[3])}function Ze(ve){o.push(h[ve*3+0]),o.push(h[ve*3+1]),o.push(h[ve*3+2])}function vt(ve){l.push(ve.x),l.push(ve.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,s=this.parameters.options;return sT(t,s,e)}static fromJSON(e,t){const s=[];for(let l=0,c=e.shapes.length;l<c;l++){const f=t[e.shapes[l]];s.push(f)}const o=e.options.extrudePath;return o!==void 0&&(e.options.extrudePath=new Uh[o.type]().fromJSON(o)),new ad(s,e.options)}}const rT={generateTopUV:function(i,e,t,s,o){const l=e[t*3],c=e[t*3+1],f=e[s*3],h=e[s*3+1],d=e[o*3],m=e[o*3+1];return[new ze(l,c),new ze(f,h),new ze(d,m)]},generateSideWallUV:function(i,e,t,s,o,l){const c=e[t*3],f=e[t*3+1],h=e[t*3+2],d=e[s*3],m=e[s*3+1],_=e[s*3+2],g=e[o*3],y=e[o*3+1],M=e[o*3+2],E=e[l*3],S=e[l*3+1],v=e[l*3+2];return Math.abs(f-m)<Math.abs(c-d)?[new ze(c,1-h),new ze(d,1-_),new ze(g,1-M),new ze(E,1-v)]:[new ze(f,1-h),new ze(m,1-_),new ze(y,1-M),new ze(S,1-v)]}};function sT(i,e,t){if(t.shapes=[],Array.isArray(i))for(let s=0,o=i.length;s<o;s++){const l=i[s];t.shapes.push(l.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Mc extends zi{constructor(e=1,t=32,s=16,o=0,l=Math.PI*2,c=0,f=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:s,phiStart:o,phiLength:l,thetaStart:c,thetaLength:f},t=Math.max(3,Math.floor(t)),s=Math.max(2,Math.floor(s));const h=Math.min(c+f,Math.PI);let d=0;const m=[],_=new G,g=new G,y=[],M=[],E=[],S=[];for(let v=0;v<=s;v++){const L=[],R=v/s;let T=0;v===0&&c===0?T=.5/t:v===s&&h===Math.PI&&(T=-.5/t);for(let B=0;B<=t;B++){const I=B/t;_.x=-e*Math.cos(o+I*l)*Math.sin(c+R*f),_.y=e*Math.cos(c+R*f),_.z=e*Math.sin(o+I*l)*Math.sin(c+R*f),M.push(_.x,_.y,_.z),g.copy(_).normalize(),E.push(g.x,g.y,g.z),S.push(I+T,1-R),L.push(d++)}m.push(L)}for(let v=0;v<s;v++)for(let L=0;L<t;L++){const R=m[v][L+1],T=m[v][L],B=m[v+1][L],I=m[v+1][L+1];(v!==0||c>0)&&y.push(R,T,I),(v!==s-1||h<Math.PI)&&y.push(T,B,I)}this.setIndex(y),this.setAttribute("position",new In(M,3)),this.setAttribute("normal",new In(E,3)),this.setAttribute("uv",new In(S,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mc(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Pn extends Ca{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Mt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Mt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=L0,this.normalScale=new ze(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ci,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class rv extends dn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Mt(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class oT extends rv{constructor(e,t,s){super(e,s),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(dn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Mt(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const zf=new Gt,jg=new G,qg=new G;class aT{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ze(512,512),this.map=null,this.mapPass=null,this.matrix=new Gt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new td,this._frameExtents=new ze(1,1),this._viewportCount=1,this._viewports=[new Xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,s=this.matrix;jg.setFromMatrixPosition(e.matrixWorld),t.position.copy(jg),qg.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(qg),t.updateMatrixWorld(),zf.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(zf),s.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),s.multiply(zf)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class lT extends aT{constructor(){super(new W0(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class cT extends rv{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(dn.DEFAULT_UP),this.updateMatrix(),this.target=new dn,this.shadow=new lT}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:jh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=jh);function sc(i,e,t){let s=i*374761393+e*668265263+t*1013904223|0;return s=Math.imul(s^s>>>13,1274126177),s=s^s>>>16,(s>>>0)/4294967295}function Yg(i){return i*i*(3-2*i)}function sv(i,e,t){const s=Math.floor(i),o=Math.floor(e),l=Yg(i-s),c=Yg(e-o),f=sc(s,o,t),h=sc(s+1,o,t),d=sc(s,o+1,t),m=sc(s+1,o+1,t),_=f+(h-f)*l,g=d+(m-d)*l;return _+(g-_)*c}function Fi(i,e,t,s=4){let o=.5,l=1,c=0,f=0;for(let h=0;h<s;h++)c+=o*sv(i*l,e*l,t+h*131),f+=o,o*=.5,l*=2.03;return c/f}function Kg(i,e,t,s=4){let o=.5,l=1,c=0,f=0;for(let h=0;h<s;h++){const d=sv(i*l,e*l,t+h*733),m=1-Math.abs(2*d-1);c+=o*m*m,f+=o,o*=.5,l*=2.11}return c/f}function an(i,e,t){return i<e?e:i>t?t:i}function bn(i,e,t){const s=an((t-i)/(e-i),0,1);return s*s*(3-2*s)}const kh=12e3,$g={y:0};function Br(i,e,t,s){return{name:i,x:e,z:t,headingDeg:s,deckY:19,deckLength:300,deckWidth:77,landingLength:240,landingAngleDeg:9.5,wireCount:4,wireSpacing:12.5,catapultOffsetX:-14,catapultLength:94}}const Wn={startAlong:-115,startAcross:5,halfWidth:15,wireFirstS:35,catchSMin:26,catchSMax:170},Mo={id:"archipelago",label:"Procedural islands",attribution:null,airfield:{centerX:-1800,centerZ:2400,elevation:140,runwayLength:2200,runwayWidth:48,headingDeg:90},carriers:[Br("ALPHA",6200,-1400,135),Br("BRAVO",9500,9500,85),Br("CHARLIE",-9500,9500,125),Br("DELTA",-9500,-9500,275)]},zh={id:"kauai",label:"Kauai, Hawaii — live terrain",attribution:"Terrain & imagery © Mapbox © OpenStreetMap",airfield:{centerX:1500,centerZ:2250,elevation:57,runwayLength:2200,runwayWidth:48,headingDeg:90},carriers:[Br("LEHUA",-10500,5500,90),Br("MAKANI",-500,10250,50),Br("NALU",10500,10500,0),Br("KAI",10500,2250,40)]};let ki=Mo,ld=fv;function uT(i,e){ki=i,ld=e}function Zg(){ki=Mo,ld=fv}function Bf(){return ki}function cd(){return ki.airfield}function Ec(){return ki.carriers}function Bh(i,e){return ld(i,e)}function fT(i,e){const t=ki.airfield,s=Math.abs(i-t.centerX),o=Math.abs(e-t.centerZ);return s<=t.runwayLength/2+60&&o<=t.runwayWidth/2+60}function ov(i){const e=i*Math.PI/180,t=[Math.sin(e),-Math.cos(e)],s=[Math.cos(e),Math.sin(e)];return{fwd:t,right:s}}function av(i,e,t){const{fwd:s,right:o}=ov(i.headingDeg),l=e-i.x,c=t-i.z;return[l*s[0]+c*s[1],l*o[0]+c*o[1]]}function hT(i,e,t){const[s,o]=av(i,e,t);return Math.abs(s)<=i.deckLength/2&&Math.abs(o)<=i.deckWidth/2}function lv(i,e){for(const t of ki.carriers)if(hT(t,i,e))return t;return null}function cv(i,e){let t=ki.carriers[0],s=1/0;for(const o of ki.carriers){const l=Math.hypot(i-o.x,e-o.z);l<s&&(s=l,t=o)}return t}function ud(i,e){const t=lv(i,e);if(t)return{y:t.deckY,kind:"deck"};const s=Bh(i,e),o=ki.airfield;return fT(i,e)&&s>o.elevation-30?{y:o.elevation,kind:"runway"}:s<$g.y?{y:$g.y,kind:"water"}:{y:s,kind:"terrain"}}function uv(i,e,t,s,o){const l=Math.abs(i-s.centerX),c=Math.abs(e-s.centerZ),f=s.runwayLength/2+100,h=s.runwayWidth/2+100,d=Math.hypot(Math.max(l-f,0),Math.max(c-h,0)),m=1-bn(0,400,d);t=t+(s.elevation-t)*m;for(const _ of o){const g=Math.hypot(i-_.x,e-_.z),y=1-bn(700,1600,g);if(y>0){const M=Math.min(t,-40);t=t*(1-y)+M*y}}return t}function dT(i){const e=zh.airfield,t=zh.carriers;return(s,o)=>{if(Math.abs(s)>kh+500||Math.abs(o)>kh+500)return-40;let l=i.sample(s,o);return l<.5&&(l=-40),uv(s,o,l,e,t)}}const pT=[{x:Mo.airfield.centerX,z:Mo.airfield.centerZ,r:4300,falloff:3400,ridgeAmp:820,hillAmp:200,seed:17},{x:2500,z:6200,r:2400,falloff:2800,ridgeAmp:1750,hillAmp:260,seed:41,coastSharp:.55},{x:-5800,z:-2600,r:2500,falloff:2600,ridgeAmp:1300,hillAmp:240,seed:73,coastSharp:.7},{x:-1500,z:-5600,r:1700,falloff:2600,ridgeAmp:120,hillAmp:60,base:14,seed:101},{x:5600,z:3600,r:1100,falloff:1700,ridgeAmp:620,hillAmp:150,seed:131},{x:6600,z:5300,r:750,falloff:1150,ridgeAmp:420,hillAmp:110,seed:149}],mT=[{x:3e3,z:6600,h:1500,r:1100},{x:1800,z:5500,h:950,r:850},{x:-6100,z:-1700,h:1150,r:950},{x:-5200,z:-3200,h:800,r:750},{x:-700,z:-900,h:850,r:950},{x:-4300,z:4500,h:720,r:800}],Qg=70;function fv(i,e){const s=Mo.airfield,o=Fi(i*8e-5,e*8e-5,1340,3)-.5,l=Fi(i*8e-5,e*8e-5,1346,3)-.5,c=i+o*3600,f=e+l*3600,h=(Fi(i*22e-5,e*22e-5,1408,4)-.5)*2600;let d=0,m=0,_=0,g=0,y=Qg;for(const P of pT){const A=Math.hypot(i-P.x,e-P.z),U=P.r+P.falloff*(P.coastSharp??1),Q=1-bn(P.r,U,A+h);Q>d&&(d=Q,_=P.ridgeAmp,g=P.hillAmp,y=P.base??Qg),m=Math.max(m,1-bn(P.r,U+2600,A))}const M=bn(.34,.72,Fi(c*11e-5,f*11e-5,1342,3)),E=Kg(c*3e-4,f*3e-4,1337,5),S=Fi(c*7e-4,f*7e-4,1346,5),v=Fi(i*.004,e*.004,1360,3);let L=0;for(const P of mT){const A=Math.hypot(i-P.x,e-P.z);if(A<P.r*1.8){const U=1-bn(P.r*.3,P.r*1.5,A);L=Math.max(L,P.h*U*U)}}const R=Math.pow(E,1.5)*_*(.35+.65*M)+S*g+v*16+L,T=Math.hypot(i-s.centerX,e-s.centerZ),B=.32+.68*bn(1400,3600,T),I=(y+R*B)*d,O=(-14-Kg(i*22e-5,e*22e-5,1377,3)*130)*(1-.5*m),z=I+O*(1-d);return uv(i,e,z,s,Mo.carriers)}const Jg={pitchUp:"Pitch up (nose up)",pitchDown:"Pitch down (nose down)",rollLeft:"Roll left",rollRight:"Roll right",yawLeft:"Yaw left (rudder)",yawRight:"Yaw right (rudder)",throttleUp:"Throttle up",throttleDown:"Throttle down",brake:"Wheel brakes",gear:"Landing gear",flaps:"Flaps",speedbrake:"Speed brake",ab:"Afterburner (toggle)",cat:"Catapult (hold)",camera:"Cycle camera",pause:"Pause",trimUp:"Trim nose up",trimDown:"Trim nose down"},hv={pitchUp:"ArrowUp",pitchDown:"ArrowDown",rollLeft:"ArrowLeft",rollRight:"ArrowRight",yawLeft:"KeyA",yawRight:"KeyD",throttleUp:"KeyW",throttleDown:"KeyS",brake:"KeyB",gear:"KeyG",flaps:"KeyF",speedbrake:"KeyX",ab:"ShiftLeft",cat:"Space",camera:"KeyC",pause:"Escape",trimUp:"KeyT",trimDown:"KeyV"},gT={low:144,medium:216,high:320},dv="f14sim.settings.v1";function Hf(){return{volume:.7,sensitivity:1,quality:"medium",world:"archipelago",bindings:{...hv}}}function vT(){try{const i=localStorage.getItem(dv);if(!i)return Hf();const e=JSON.parse(i),t=Hf();return{volume:typeof e.volume=="number"?t0(e.volume,0,1):t.volume,sensitivity:typeof e.sensitivity=="number"?t0(e.sensitivity,.4,1.5):t.sensitivity,quality:e.quality==="low"||e.quality==="medium"||e.quality==="high"?e.quality:t.quality,world:e.world==="archipelago"||e.world==="kauai"?e.world:t.world,bindings:{...t.bindings,...e.bindings??{}}}}catch{return Hf()}}function e0(i){try{localStorage.setItem(dv,JSON.stringify(i))}catch{}}function t0(i,e,t){return i<e?e:i>t?t:i}function _T(i){return i.startsWith("Arrow")?{Up:"↑",Down:"↓",Left:"←",Right:"→"}[i.slice(5)]??i:i.startsWith("Key")?i.slice(3):i.startsWith("Digit")?i.slice(5):i==="ShiftLeft"?"L Shift":i==="ShiftRight"?"R Shift":i==="Space"?"Space":i==="Escape"?"Esc":i==="Minus"?"-":i==="Equal"?"=":i}const Vf=kh;function Tt(i,e,t){return i+(e-i)*t}function xT(i,e,t,s,o){if(i<-1){const E=lr.clamp((i+90)/90,0,1);o.setRGB(Tt(.05,.27,E),Tt(.13,.46,E),Tt(.19,.5,E),fn);return}const l=Fi(t*.0016,s*.0016,4242,3),c=(Fi(t*.02,s*.02,808,2)-.5)*.06;let f=Tt(.44,.29,l),h=Tt(.48,.4,l),d=Tt(.28,.21,l);f+=c,h+=c,d+=c;const m=1-bn(9,42,i);f=Tt(f,.83,m),h=Tt(h,.77,m),d=Tt(d,.57,m);const _=bn(.5,.95,e);f=Tt(f,.38,_),h=Tt(h,.36,_),d=Tt(d,.33,_);const g=bn(560,820,i)*(1-.5*_);f=Tt(f,.47,g),h=Tt(h,.45,g),d=Tt(d,.43,g);const y=760+l*280,M=bn(y,y+170,i)*(1-bn(.8,1.15,e));f=Tt(f,.93,M),h=Tt(h,.95,M),d=Tt(d,.97,M),o.setRGB(f,h,d,fn)}function yT(i,e,t,s,o){if(i<-1){const y=lr.clamp((i+90)/90,0,1);o.setRGB(Tt(.05,.27,y),Tt(.13,.46,y),Tt(.19,.5,y),fn);return}const l=Fi(t*.0011,s*.0011,991,3),c=(Fi(t*.02,s*.02,553,2)-.5)*.06;let f=Tt(.24,.34,l)+c,h=Tt(.42,.38,l)+c,d=Tt(.2,.24,l)+c;const m=1-bn(3,30,i);f=Tt(f,.82,m),h=Tt(h,.76,m),d=Tt(d,.57,m);const _=bn(.55,1.05,e);f=Tt(f,.36,_),h=Tt(h,.34,_),d=Tt(d,.31,_);const g=bn(700,1100,i)*(1-.6*_)*.5;f=Tt(f,.42,g),h=Tt(h,.4,g),d=Tt(d,.38,g),o.setRGB(f,h,d,fn)}const ST={island:xT,tropical:yT};function MT(i,e){const t=gT[i],s=new To(Vf*2,Vf*2,t,t);s.rotateX(-Math.PI/2);const o=s.attributes.position,l=t+1,c=Vf*2/t,f=new Float32Array(o.count);for(let m=0;m<o.count;m++){const _=e.height(o.getX(m),o.getZ(m));o.setY(m,_),f[m]=_}let h;if(e.texture){const{canvas:m,worldX0:_,worldZ0:g,worldW:y,worldH:M}=e.texture,E=s.attributes.uv;for(let v=0;v<o.count;v++)E.setXY(v,(o.getX(v)-_)/y,(o.getZ(v)-g)/M);E.needsUpdate=!0;const S=new Ra(m);S.flipY=!1,S.colorSpace=fn,S.anisotropy=8,h=new Pn({map:S,roughness:1,metalness:0})}else{const m=ST[e.style],_=new Float32Array(o.count*3),g=new Mt;for(let y=0;y<o.count;y++){const M=y%l,E=y/l|0,S=M>0?y-1:y,v=M<l-1?y+1:y,L=E>0?y-l:y,R=E<l-1?y+l:y,T=(f[v]-f[S])/(Math.abs(v-S)*c),B=(f[R]-f[L])/(Math.abs(R-L)*c);m(f[y],Math.hypot(T,B),o.getX(y),o.getZ(y),g),_[y*3]=g.r,_[y*3+1]=g.g,_[y*3+2]=g.b}s.setAttribute("color",new Ti(_,3)),h=new Pn({vertexColors:!0,roughness:1,metalness:0})}s.computeVertexNormals();const d=new Nt(s,h);return d.receiveShadow=i!=="low",d}function ET(){const e=document.createElement("canvas");e.width=256,e.height=256;const t=e.getContext("2d"),s=t.createImageData(256,256),o=[[2,1,.6,1],[1,2,2.2,.9],[3,2,4.1,.6],[2,3,1.4,.55],[5,3,3.3,.4],[3,5,5,.38],[7,4,.9,.26],[4,7,2.7,.24]],l=o.reduce((f,h)=>f+h[3],0);for(let f=0;f<256;f++)for(let h=0;h<256;h++){let d=0;for(const[g,y,M,E]of o)d+=E*Math.sin(2*Math.PI*(g*h/256+y*f/256)+M);d/=l;const m=Math.round(255*(.62+.38*Math.tanh(d*1.7))),_=(f*256+h)*4;s.data[_]=m,s.data[_+1]=m,s.data[_+2]=m,s.data[_+3]=255}t.putImageData(s,0,0);const c=new Ra(e);return c.wrapS=xa,c.wrapT=xa,c.repeat.set(96,96),c.anisotropy=4,c}function wT(){const i=new To(6e4,6e4,1,1);i.rotateX(-Math.PI/2);const e=ET(),t=new Pn({color:1459294,roughness:.5,metalness:.4,transparent:!0,opacity:.9,bumpMap:e,bumpScale:1.6,roughnessMap:e}),s=new Nt(i,t);return s.position.y=0,s}function TT(){const i=new Mc(42e3,24,16),e=document.createElement("canvas");e.width=256,e.height=256;const t=e.getContext("2d"),s=t.createLinearGradient(0,0,0,256);s.addColorStop(0,"#3d7ab8"),s.addColorStop(.55,"#9ec7e6"),s.addColorStop(.78,"#e8dfc8"),s.addColorStop(1,"#c8d4dc"),t.fillStyle=s,t.fillRect(0,0,256,256);const o=new Ra(e),l=new xc({map:o,side:Dn,fog:!1});return new Nt(i,l)}function AT(i){const e=document.createElement("canvas");e.width=1024,e.height=768;const t=e.getContext("2d");t.fillStyle="#3d4348",t.fillRect(0,0,1024,768),t.fillStyle="#464d53";for(let E=0;E<2600;E++)t.fillRect(Math.random()*1024,Math.random()*768,3,3);const s=1024/i.deckLength,o=768/i.deckWidth,l=E=>(E+i.deckLength/2)*s,c=E=>(E+i.deckWidth/2)*o,f=i.landingAngleDeg*Math.PI/180,h=Math.cos(f),d=Math.sin(f),m=(E,S)=>l(Wn.startAlong+E*h+S*d),_=(E,S)=>c(Wn.startAcross-E*d+S*h),g=Wn.halfWidth,y=i.landingLength;t.fillStyle="#2a2f34",t.beginPath(),t.moveTo(m(0,-g),_(0,-g)),t.lineTo(m(y,-g),_(y,-g)),t.lineTo(m(y,g),_(y,g)),t.lineTo(m(0,g),_(0,g)),t.closePath(),t.fill(),t.strokeStyle="#e8e8e5",t.lineWidth=3;for(const E of[-g,g])t.beginPath(),t.moveTo(m(0,E),_(0,E)),t.lineTo(m(y,E),_(y,E)),t.stroke();t.lineWidth=4;for(let E=16;E<y-26;E+=34)t.beginPath(),t.moveTo(m(E,0),_(E,0)),t.lineTo(m(E+22,0),_(E+22,0)),t.stroke();t.strokeStyle="#f2f2ef",t.lineWidth=8;for(let E=0;E<i.wireCount;E++){const S=Wn.wireFirstS+E*i.wireSpacing;t.beginPath(),t.moveTo(m(S,-g),_(S,-g)),t.lineTo(m(S,g),_(S,g)),t.stroke()}t.fillStyle="#f2f2ef";for(let E=0;E<3;E++){const S=6+E*7;t.beginPath(),t.moveTo(m(S,-g+3),_(S,-g+3)),t.lineTo(m(S+2.5,-g+3),_(S+2.5,-g+3)),t.lineTo(m(S+2.5,g-3),_(S+2.5,g-3)),t.lineTo(m(S,g-3),_(S,g-3)),t.closePath(),t.fill()}t.strokeStyle="#d8d8d2",t.lineWidth=5,t.beginPath(),t.moveTo(l(-40),c(i.catapultOffsetX)),t.lineTo(l(-40+i.catapultLength),c(i.catapultOffsetX)),t.stroke(),t.lineWidth=3;for(const E of[-40,-40+i.catapultLength])t.beginPath(),t.moveTo(l(E),c(i.catapultOffsetX-6)),t.lineTo(l(E),c(i.catapultOffsetX+6)),t.stroke();t.strokeStyle="#b7beb4",t.lineWidth=3,t.strokeRect(6,6,1012,756);const M=new Ra(e);return M.anisotropy=8,M}function CT(i){const e=new un,t=i.deckLength,s=i.deckWidth,o=i.deckY,l=o-1,c=l+14,f=new Pn({color:5659488,roughness:.9}),h=t/2+2,d=s/2+1,m=new ev;m.moveTo(-h,-d),m.lineTo(h-55,-d),m.lineTo(h+26,0),m.lineTo(h-55,d),m.lineTo(-h,d),m.closePath();const _=new ad(m,{depth:c,bevelEnabled:!1});_.rotateX(Math.PI/2);const g=new Nt(_,f);g.position.y=l,e.add(g);const y=new Nt(new Xn(t,1,s),new Pn({map:AT(i),roughness:.95}));y.position.y=o-.5,e.add(y);const M=new Nt(new Xn(28,22,14),new Pn({color:9080716,roughness:.9}));M.position.set(0,o+10.5,30),e.add(M);const E=new Nt(new Ei(1.2,1.6,16,6),new Pn({color:7238518}));E.position.set(0,o+29,30),e.add(E);const S=new Nt(new Ei(4.5,4.5,.6,20,1,!0,0,Math.PI),new Pn({color:14408661,roughness:.7,side:ci}));S.position.set(0,o+38,30),e.add(S);const v=i.landingAngleDeg*Math.PI/180,L=Math.cos(v),R=Math.sin(v),T=new Pn({color:2829099}),B=new Xn(.22,.22,Wn.halfWidth*2);for(let I=0;I<i.wireCount;I++){const O=Wn.wireFirstS+I*i.wireSpacing,z=Wn.startAlong+O*L,P=Wn.startAcross-O*R,A=new Nt(B,T);A.position.set(z,o+.35,P),A.rotation.y=v,e.add(A)}return e.position.set(i.x,0,i.z),e.rotation.y=(90-i.headingDeg)*Math.PI/180,e.castShadow=!1,e.receiveShadow=!0,e}function RT(){const i=document.createElement("canvas");i.width=1024,i.height=128;const e=i.getContext("2d");e.fillStyle="#4b4f54",e.fillRect(0,0,1024,128),e.strokeStyle="#dfe3e6",e.lineWidth=6,e.setLineDash([60,45]),e.beginPath(),e.moveTo(10,64),e.lineTo(1014,64),e.stroke(),e.setLineDash([]),e.strokeRect(4,8,1016,112),e.fillStyle="#dfe3e6";for(let s=0;s<6;s++)e.fillRect(24,8+s*20,26,8);const t=new Ra(i);return t.anisotropy=8,t}function PT(){const i=new un,e=cd(),t=new Nt(new Xn(e.runwayLength,.6,e.runwayWidth),new Pn({map:RT(),roughness:1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));t.position.set(e.centerX,e.elevation-.28,e.centerZ),i.add(t);const s=new Pn({color:8226704,roughness:.9}),o=new Nt(new Xn(60,18,40),s);o.position.set(e.centerX-200,e.elevation+9,e.centerZ-140),i.add(o);const l=new Nt(new Xn(60,18,40),s);l.position.set(e.centerX+120,e.elevation+9,e.centerZ-150),i.add(l);const c=new Nt(new Ei(6,8,34,10),s);return c.position.set(e.centerX-60,e.elevation+17,e.centerZ-160),i.add(c),i}const Ii=new Pn({color:10134445,roughness:.55,metalness:.35}),lo=new Pn({color:2304046,roughness:.85,metalness:.2}),bT=new Pn({color:2768202,roughness:.15,metalness:.6,transparent:!0,opacity:.85}),LT=new xc({color:8373503,transparent:!0,opacity:0,blending:Kf,depthWrite:!1,side:ci}),kr=new Pn({color:9410722,roughness:.6,metalness:.3,side:ci});function Mn(i,e,t,s,o,l=0,c=0){const f=new Xn(1,1,1),h=f.attributes.position;for(let d=0;d<h.count;d++){const m=h.getZ(d),_=m+.5,g=i+(t-i)*_,y=e+(s-e)*_;h.setX(d,h.getX(d)*g+l*_),h.setY(d,h.getY(d)*y+c*_),h.setZ(d,m*o)}return f.computeVertexNormals(),f}function qt(i,e,t,s=0,o=0,l=0){const c=new Nt(e,t);return c.position.set(s,o,l),i.add(c),c}function n0(i,e){const t=new Ei(i,i,e*2,12),s=new Nt(t,lo);return s.rotation.z=Math.PI/2,s}function DT(){const i=new un;qt(i,Mn(.5,.45,1.7,1.5,1.9,0,-.08),Ii,0,.1,-8.6),qt(i,Mn(1.7,1.5,3,2.2,3.9),Ii,0,0,-5.9),qt(i,Mn(3,2.2,3.5,2.45,7),Ii,0,0,-.5),qt(i,Mn(3.5,2.45,3.1,2.1,4.6,0,.1),Ii,0,0,5.3),qt(i,Mn(3.1,2.1,2.6,1.6,1.8,0,-.25),Ii,0,0,8.5),qt(i,Mn(2,.7,2.3,.8,6),Ii,0,1.1,4.5),qt(i,Mn(1.2,.6,2,.8,2.2),Ii,0,.95,-2.9),qt(i,Mn(1,.34,2,.22,3),kr,1.9,.28,-1.2),qt(i,Mn(1,.34,2,.22,3),kr,-1.9,.28,-1.2);const e=new un;qt(e,Mn(1.2,1.7,1.1,1.9,3.2),Ii,2.25,-.1,-3),qt(e,Mn(1.2,1.7,1.1,1.9,3.2),Ii,-2.25,-.1,-3);const t=new Ei(.52,.52,.3,16),s=qt(e,t,lo,2.25,.2,-4.65);s.rotation.x=Math.PI/2;const o=qt(e,t,lo,-2.25,.2,-4.65);o.rotation.x=Math.PI/2,i.add(e);const l=qt(i,new Mc(.85,16,12),bT,0,1.15,-5.6);l.scale.set(.95,.8,2.3);const c=new Ei(.58,.66,1.2,14,1,!0);for(const v of[-1,1]){const L=qt(i,c,lo,v*.85,-.15,9.4);L.rotation.x=Math.PI/2}const f=new od(.5,2.6,12,1,!0),h=new Nt(f,LT.clone());h.rotation.x=Math.PI/2,h.position.set(0,-.15,11),i.add(h);const d=[new un,new un],m=[],_=[];for(let v=0;v<2;v++){const L=v===0?1:-1,R=new un;R.position.set(L*1.55,.25,.8);const T=Mn(4.3,.3,2.3,.12,7.8);T.translate(0,0,3.9);const B=new Nt(T,kr);B.rotation.y=L*(Math.PI/2),R.add(B);const I=new un;I.position.set(-1.85,0,2.9);const O=new Xn(1,.09,3.6),z=new Nt(O,kr);z.position.x=-.5,I.add(z),B.add(I),i.add(R),d[v]=R,m[v]=B,_[v]=I}const g=[new un,new un];for(let v=0;v<2;v++){const L=v===0?1:-1,R=new un;R.position.set(L*1.35,-.45,7.4);const T=Mn(2,.16,1.1,.08,3.4);T.translate(0,0,1.7);const B=new Nt(T,kr);B.rotation.y=L*(Math.PI/2),R.add(B),R.rotation.z=-L*.06,i.add(R),g[v]=R}const y=[];for(let v=0;v<2;v++){const L=v===0?1:-1,R=qt(i,Mn(.18,3,.14,2,3,.35,0),Ii,L*1.7,1.85,7.9),T=qt(R,new Xn(.1,2,.75),kr,.2,-.35,1.75);y[v]=T}qt(i,Mn(.12,.8,.1,.5,1.6,0,.25),kr,1.45,-1.05,6.9),qt(i,Mn(.12,.8,.1,.5,1.6,0,.25),kr,-1.45,-1.05,6.9);const M=new un,E=new Ei(.08,.08,.9,8);qt(M,E,lo,0,-1.28,-6);const S=n0(.3,.12);S.position.set(0,-1.73,-6),M.add(S);for(const v of[-1,1]){const L=new Ei(.1,.1,.8,8);qt(M,L,lo,v*2.3,-1.25,.5);const R=n0(.33,.14);R.position.set(v*2.3,-1.7,.5),M.add(R)}return i.add(M),i.traverse(v=>{v.frustumCulled=!1}),{group:i,wings:d,wingPanels:m,stabs:g,rudders:y,flaps:_,gear:M,canopy:l,intakes:e,afterburner:h}}class NT{constructor(e,t,s){Le(this,"renderer");Le(this,"scene");Le(this,"camera");Le(this,"jet");Le(this,"jetGroup");Le(this,"sun");Le(this,"oceanMat");Le(this,"quality");Le(this,"worldRoot",new un);this.quality=t,this.renderer=new A1({canvas:e,antialias:t!=="low",powerPreference:"high-performance"}),this.renderer.shadowMap.enabled=t!=="low",this.renderer.shadowMap.type=_0,this.scene=new C1,this.scene.fog=new id(12571616,3500,3e4),this.camera=new li(62,1,.5,48e3),this.camera.position.set(0,200,200);const o=new oT(12572927,7043669,.75);this.scene.add(o),this.sun=new cT(16773853,2),this.sun.position.set(4e3,5500,1500),this.scene.add(this.sun),this.sun.castShadow=t!=="low",this.sun.shadow.mapSize.set(2048,2048);const l=this.sun.shadow.camera;l.left=-60,l.right=60,l.top=60,l.bottom=-60,l.near=1,l.far=14e3,this.sun.shadow.bias=-5e-4,this.scene.add(TT());const c=wT();this.oceanMat=c.material,this.scene.add(c),this.scene.add(this.worldRoot),this.applyWorld(s),this.jet=DT(),this.jetGroup=this.jet.group,this.scene.add(this.jetGroup)}applyWorld(e){IT(this.worldRoot),this.worldRoot.clear(),this.worldRoot.add(MT(this.quality,e)),this.worldRoot.add(PT());for(const t of Ec())this.worldRoot.add(CT(t))}applyQuality(e){this.quality=e;const t=e==="low"?.75:e==="medium"?Math.min(window.devicePixelRatio,1.5):Math.min(window.devicePixelRatio,2);this.renderer.setPixelRatio(t),this.resize()}resize(){const e=this.renderer.domElement,t=e.clientWidth||window.innerWidth,s=e.clientHeight||window.innerHeight;this.renderer.setSize(t,s,!1),this.camera.aspect=t/Math.max(s,1),this.camera.updateProjectionMatrix()}render(){const e=performance.now()/1e3,t=this.oceanMat.bumpMap;t&&t.offset.set(e*.006,e*.0025),this.renderer.render(this.scene,this.camera)}}function i0(i){var t,s,o,l;const e=i;(t=e.map)==null||t.dispose(),(s=e.bumpMap)==null||s.dispose(),(o=e.roughnessMap)==null||o.dispose(),(l=e.normalMap)==null||l.dispose(),i.dispose()}function IT(i){i.traverse(e=>{const t=e;t.geometry&&t.geometry.dispose();const s=t.material;if(Array.isArray(s))for(const o of s)i0(o);else s&&i0(s)})}function UT(i,e,t,s){const o=i.group,l=lr.degToRad(20+48*e.sweepT);i.wings[0].rotation.y=-l,i.wings[1].rotation.y=l;const c=.45*e.flapT,f=Gf(o.userData.aileron??0,.5);i.flaps[0].rotation.z=c-f*.4,i.flaps[1].rotation.z=-(c+f*.4);const h=Gf(o.userData.elevator??0,.6);i.stabs[0].rotation.x=h,i.stabs[1].rotation.x=h;const d=Gf(o.userData.rudder??0,.5);i.rudders[0].rotation.y=d,i.rudders[1].rotation.y=-d;const m=e.gearT;i.gear.visible=m>.02,i.gear.scale.y=Math.max(.08,m),i.gear.position.y=(1-m)*1.1+(m>.02?e.wheelPen:0);const _=i.afterburner.material,g=.85+.15*Math.sin(e.time*47)*Math.sin(e.time*31),y=e.abLevel;if(_.opacity=y*.85*g,i.afterburner.scale.set(.8+y*.5,1,1.6*y+.2),i.afterburner.visible=y>.02,o.userData.exhaustLight){const M=o.userData.exhaustLight;M.intensity=y*40*g}}function Gf(i,e){return i<-e?-e:i>e?e:i}class FT{constructor(){Le(this,"mode","chase");Le(this,"yaw",0);Le(this,"pitch",0);Le(this,"orbitAngle",0);Le(this,"orbitTimer",0);Le(this,"cockpitPos",new G(0,1.15,-4.4));Le(this,"smoothed",new G);Le(this,"tmpQ",new Ai);Le(this,"lookTarget",new G)}cycle(){this.mode=this.mode==="chase"?"cockpit":this.mode==="cockpit"?"orbit":"chase",this.mode!=="chase"&&(this.yaw=0,this.pitch=0)}label(){return this.mode==="cockpit"?"COCKPIT":this.mode==="chase"?"CHASE":"ORBIT"}mouse(e,t){this.mode!=="cockpit"&&(this.yaw=lr.clamp(this.yaw-e*.004,-2.6,2.6),this.pitch=lr.clamp(this.pitch-t*.004,-1.2,1.2))}update(e,t,s,o,l){if(this.mode==="cockpit"){e.position.copy(t).add(this.cockpitPos.clone().applyQuaternion(s)),e.quaternion.copy(s),e.rotateX(-this.pitch*.15);return}if(this.mode==="chase"){const m=26+Math.min(o*.08,10),_=new G(0,7.5,m).applyQuaternion(s),g=new Ai().setFromEuler(new Ci(this.pitch,this.yaw,0,"YXZ")),y=_.clone().applyQuaternion(this.tmpQ.copy(s).multiply(g)),M=t.clone().add(y);this.smoothed.lerp(M,1-Math.exp(-l*8)),e.position.copy(this.smoothed),this.lookTarget.copy(t).add(new G(0,1.5,0).applyQuaternion(s)),e.up.set(0,1,0).applyQuaternion(s).lerp(new G(0,1,0),.55).normalize(),e.lookAt(this.lookTarget);return}this.orbitTimer+=l;const c=34+Math.sin(this.orbitTimer*.21)*6;this.orbitAngle+=l*.14;const f=t.x+Math.cos(this.orbitAngle)*c,h=t.z+Math.sin(this.orbitAngle)*c,d=t.y+9+Math.sin(this.orbitTimer*.33)*3;e.position.set(f,d,h),e.up.set(0,1,0),e.lookAt(t)}}class OT{constructor(){Le(this,"ctx",null);Le(this,"master",null);Le(this,"started",!1);Le(this,"whine",null);Le(this,"whineGain",null);Le(this,"whine2",null);Le(this,"whineGain2",null);Le(this,"rumbleSrc",null);Le(this,"rumbleGain",null);Le(this,"rumbleFilter",null);Le(this,"windSrc",null);Le(this,"windGain",null);Le(this,"windFilter",null);Le(this,"windQ",null);Le(this,"volume",.7)}start(){if(this.started)return;try{const f=window.AudioContext??window.webkitAudioContext;this.ctx=new f}catch{return}const e=this.ctx;if(!e)return;this.started=!0,this.master=e.createGain(),this.master.gain.value=this.volume,this.master.connect(e.destination),this.whine=e.createOscillator(),this.whine.type="sawtooth",this.whine.frequency.value=300;const t=e.createBiquadFilter();t.type="lowpass",t.frequency.value=2200,this.whineGain=e.createGain(),this.whineGain.gain.value=0,this.whine.connect(t).connect(this.whineGain).connect(this.master),this.whine.start(),this.whine2=e.createOscillator(),this.whine2.type="sawtooth",this.whine2.frequency.value=306,this.whineGain2=e.createGain(),this.whineGain2.gain.value=0,this.whine2.connect(this.whineGain2).connect(t),this.whine2.start();const s=e.createBuffer(1,e.sampleRate*2,e.sampleRate),o=s.getChannelData(0);let l=0;for(let f=0;f<o.length;f++){const h=Math.random()*2-1;l=(l+.02*h)/1.02,o[f]=l*3.5}const c=()=>{const f=e.createBufferSource();return f.buffer=s,f.loop=!0,f};this.rumbleSrc=c(),this.rumbleFilter=e.createBiquadFilter(),this.rumbleFilter.type="lowpass",this.rumbleFilter.frequency.value=200,this.rumbleGain=e.createGain(),this.rumbleGain.gain.value=0,this.rumbleSrc.connect(this.rumbleFilter).connect(this.rumbleGain).connect(this.master),this.rumbleSrc.start(),this.windSrc=c(),this.windFilter=e.createBiquadFilter(),this.windFilter.type="bandpass",this.windFilter.frequency.value=500,this.windFilter.Q.value=.8,this.windGain=e.createGain(),this.windGain.gain.value=0,this.windQ=e.createBiquadFilter(),this.windQ.type="highpass",this.windQ.frequency.value=150,this.windSrc.connect(this.windFilter).connect(this.windGain).connect(this.windQ).connect(this.master),this.windSrc.start()}resume(){var e;(e=this.ctx)==null||e.resume()}setVolume(e){this.volume=e,this.master&&this.ctx&&this.master.gain.setTargetAtTime(e,this.ctx.currentTime,.1)}update(e,t,s,o,l){var g,y,M,E,S,v,L,R;if(!this.ctx||!this.started)return;const c=this.ctx.currentTime,f=.08,h=l?0:1,d=240+1250*e+180*t,m=h*(.012+.05*e+.02*t);(g=this.whine)==null||g.frequency.setTargetAtTime(d,c,f),(y=this.whine2)==null||y.frequency.setTargetAtTime(d*1.51,c,f),(M=this.whineGain)==null||M.gain.setTargetAtTime(m,c,f),(E=this.whineGain2)==null||E.gain.setTargetAtTime(m*.6,c,f),(S=this.rumbleFilter)==null||S.frequency.setTargetAtTime(120+500*e+300*t,c,f),(v=this.rumbleGain)==null||v.gain.setTargetAtTime(h*(.05+.22*e+.25*t),c,f);const _=Math.min(1,s/320);(L=this.windFilter)==null||L.frequency.setTargetAtTime(300+1100*_,c,f),(R=this.windGain)==null||R.gain.setTargetAtTime(h*(.4*_*_+(o?.15:0)),c,f)}dispose(){var e,t,s,o,l;(e=this.whine)==null||e.stop(),(t=this.whine2)==null||t.stop(),(s=this.rumbleSrc)==null||s.stop(),(o=this.windSrc)==null||o.stop(),(l=this.ctx)==null||l.close(),this.started=!1}}class kT{constructor(e){Le(this,"bindings");Le(this,"sensitivity");Le(this,"down",new Set);Le(this,"pressedQueue",new Set);Le(this,"consumed",new Set);Le(this,"pitch",0);Le(this,"roll",0);Le(this,"yaw",0);Le(this,"mouseDX",0);Le(this,"mouseDY",0);Le(this,"dragging",!1);Le(this,"capture",null);Le(this,"el",null);Le(this,"onKeyBound",e=>this.onKeyDown(e));Le(this,"onKeyUpBound",e=>this.onKeyUp(e));Le(this,"onDownBound",e=>this.onMouseDown(e));Le(this,"onUpBound",()=>this.dragging=!1);Le(this,"onMoveBound",e=>this.onMouseMove(e));Le(this,"onBlurBound",()=>this.down.clear());this.bindings={...e.bindings},this.sensitivity=e.sensitivity}attach(e){this.el=e,window.addEventListener("keydown",this.onKeyBound),window.addEventListener("keyup",this.onKeyUpBound),window.addEventListener("blur",this.onBlurBound),e.addEventListener("mousedown",this.onDownBound),window.addEventListener("mouseup",this.onUpBound),window.addEventListener("mousemove",this.onMoveBound)}detach(){window.removeEventListener("keydown",this.onKeyBound),window.removeEventListener("keyup",this.onKeyUpBound),window.removeEventListener("blur",this.onBlurBound),this.el&&(this.el.removeEventListener("mousedown",this.onDownBound),this.el=null),window.removeEventListener("mouseup",this.onUpBound),window.removeEventListener("mousemove",this.onMoveBound)}applySettings(e){this.bindings={...e.bindings},this.sensitivity=e.sensitivity}onKeyDown(e){if(this.capture){e.preventDefault(),this.capture(e.code);return}if(e.repeat)return;const t=e.code,s=this.actionFor(t);s&&e.preventDefault(),this.down.add(t),s&&!this.consumed.has(s)&&(this.pressedQueue.add(s),this.consumed.add(s))}onKeyUp(e){this.down.delete(e.code);const t=this.actionFor(e.code);t&&this.consumed.delete(t)}onMouseDown(e){e.button===0&&(this.dragging=!0)}onMouseMove(e){this.dragging&&(this.mouseDX+=e.movementX??0,this.mouseDY+=e.movementY??0)}actionFor(e){for(const t of Object.keys(this.bindings))if(this.bindings[t]===e)return t;return null}isDown(e){return this.down.has(this.bindings[e])}take(e){return this.pressedQueue.has(e)?(this.pressedQueue.delete(e),!0):!1}clearEdges(){this.pressedQueue.clear()}sample(e){const t=3.6*this.sensitivity,s=(this.isDown("pitchUp")?1:0)-(this.isDown("pitchDown")?1:0),o=(this.isDown("rollRight")?1:0)-(this.isDown("rollLeft")?1:0),l=(this.isDown("yawRight")?1:0)-(this.isDown("yawLeft")?1:0);return this.pitch=Wf(this.pitch,s,t*e),this.roll=Wf(this.roll,o,t*e),this.yaw=Wf(this.yaw,l,t*e),{pitch:Xf(this.pitch),roll:Xf(this.roll),yaw:Xf(this.yaw),throttleUp:this.isDown("throttleUp"),throttleDown:this.isDown("throttleDown"),trimUp:this.isDown("trimUp"),trimDown:this.isDown("trimDown"),brake:this.isDown("brake"),catHold:this.isDown("cat")}}takeMouse(){const e={dx:this.mouseDX,dy:this.mouseDY};return this.mouseDX=0,this.mouseDY=0,e}}function Wf(i,e,t){return i<e?Math.min(i+t,e):i>e?Math.max(i-t,e):i}function Xf(i){const e=Math.sign(i),t=Math.abs(i);return e*(.35*t+.65*t*t*t)}function zT(i){const e=Math.max(-500,Math.min(2e4,i));let t,s;e<11e3?(t=288.15-.0065*e,s=101325*Math.pow(t/288.15,5.2559)):(t=216.65,s=22632.06*Math.exp(-15769e-8*(e-11e3)));const o=s/(287.0531*t),l=20.0468*Math.sqrt(t);return{rho:o,temp:t,soundSpeed:l,sigma:o/1.225}}const mo=3e4,Hh=9.81,jf=54.6,BT=19.5,HT=4.88,r0=3e5,s0=5e5,o0=6e4,a0=.1,l0=5,so=.26,VT=.026,GT=.05,WT=.32,XT=40,jT=-.2,qT=.16,YT=.02,KT=.09,$T=.08,ZT=.03,QT=2,JT=-.12,eA=.35,tA=15e4,c0=3500,nA=11e4,fd=-2.03,pv=.3,Vh=.33,iA={x:0,y:fd+pv,z:-6},qf={x:2.3,y:fd+Vh,z:.5},Yf=-1.05,va=6e5,_a=26e4,rA=18e5,mv=va*(3/13),Gh=va*(18/13),sA=_a*(3/13),u0=_a*(18/13),gv=mo*Hh/(mv+2*Gh),f0=-fd-gv,oA=.08,aA=.7,oc=27.6,h0=72,lA=27;function Wh(i){const e=i*Math.PI/180;return new Ai().setFromAxisAngle(new G(0,1,0),-e)}function ac(i,e=0){const t=Ec(),s=Math.max(0,Math.min(e,t.length-1)),o=cd();let l,c,f="idle";if(i==="carrier")l=vv(t[s]).start.clone(),l.y=t[s].deckY+f0,c=Wh(t[s].headingDeg),f="ready";else{const h=o.centerX-o.runwayLength/2+120,d=o.centerZ;l=new G(h,o.elevation+f0,d),c=Wh(o.headingDeg)}return{pos:l,vel:new G(0,0,0),quat:c,omega:new G(0,0,0),throttle:0,rpm:.05,abOn:!1,abLevel:0,gearDown:!0,gearT:1,flapsDown:!0,flapT:1,speedbrake:!1,sbT:0,brakeOn:!1,trim:.5,sweepT:0,sweep:20,speed:0,mach:0,alpha:0,gLoad:1,vspeed:0,headingDeg:i==="carrier"?t[s].headingDeg:o.headingDeg,stalled:!1,onGround:!0,groundKind:i==="carrier"?"deck":"runway",wheelPen:gv,catPhase:f,catProgress:0,arresting:!1,catCooldown:0,catCarrier:s,airborne:!1,flightTime:0,time:0,result:null,banner:i==="carrier"?{text:`CARRIER ${t[s].name} — HOLD SPACE FOR CATAPULT`,until:30}:{text:"THROTTLE UP (W) — ROTATE AT 150 KT",until:30},prevPos:l.clone(),prevQuat:c.clone()}}function vv(i){const{fwd:e,right:t}=ov(i.headingDeg);return{start:new G(i.x+e[0]*-40+t[0]*i.catapultOffsetX,0,i.z+e[1]*-40+t[1]*i.catapultOffsetX),dir:new G(e[0],0,e[1])}}const cA=Wn.startAlong,uA=Wn.startAcross,d0=Wn.halfWidth,fA=Wn.wireFirstS,hA=Wn.catchSMin,dA=Wn.catchSMax;function pA(i,e,t){const[s,o]=av(i,e,t),l=i.landingAngleDeg*Math.PI/180,c=Math.cos(l),f=Math.sin(l),h=s-cA,d=o-uA,m=h*c-d*f,_=h*f+d*c;return{s:m,d:_}}function mA(i,e,t){if(i.result)return;i.time+=t,i.flightTime+=t,e.throttleUp&&(i.throttle=an(i.throttle+t*.5,0,1)),e.throttleDown&&(i.throttle=an(i.throttle-t*.5,0,1)),e.trimUp&&(i.trim=an(i.trim+t*.35,0,1)),e.trimDown&&(i.trim=an(i.trim-t*.35,0,1)),i.brakeOn=e.brake||i.catPhase==="ready"||i.catPhase==="charging";const s=i.throttle>i.rpm?1.2:1.8;i.rpm+=(i.throttle-i.rpm)*(1-Math.exp(-t/s));const o=i.abOn&&i.throttle>.9?1:0;if(i.abLevel+=(o-i.abLevel)*(1-Math.exp(-t/.5)),i.gearT=an(i.gearT+(i.gearDown?t/1.8:-t/1.8),0,1),i.flapT=an(i.flapT+(i.flapsDown?t/2.2:-t/2.2),0,1),i.sbT=an(i.sbT+(i.speedbrake?t/.9:-t/.9),0,1),i.catPhase==="ready"&&e.catHold&&(i.catPhase="charging",i.catProgress=0),i.catCooldown>0&&(i.catCooldown-=t),i.catPhase==="charging"){i.catProgress=an(i.catProgress+t/.9,0,1),e.catHold?i.catProgress>=1&&(i.catPhase="firing",i.catProgress=0,i.banner={text:"CAT SHOT — PULL UP",until:i.time+3}):(i.catPhase="ready",i.catProgress=0);return}if(i.catPhase==="firing"){i.catProgress=an(i.catProgress+t/(h0/oc),0,1);const z=i.catProgress*(h0/oc),P=Ec(),A=P[Math.min(i.catCarrier,P.length-1)],U=vv(A),Q=.5*oc*z*z,Y=oc*z;i.pos.copy(U.start).addScaledVector(U.dir,Q),i.pos.y=A.deckY+2.4,i.quat.copy(Wh(A.headingDeg)).multiply(new Ai().setFromAxisAngle(new G(1,0,0),.105)),i.vel.copy(U.dir).multiplyScalar(Y),i.speed=Y,i.mach=Y/340,i.vspeed=0,i.omega.set(0,0,0),i.catProgress>=1&&(i.catPhase="idle",i.airborne=!0,i.catCooldown=4);return}const l=zT(i.pos.y),c=i.quat.clone().invert(),f=i.vel.clone().applyQuaternion(c),h=f.length(),d=-f.z,m=h>1?Math.atan2(-f.y,Math.max(d,.5)):0,_=h>1?an(Math.atan2(f.x,Math.max(d,.5)),-.5,.5):0;i.speed=h,i.mach=h/l.soundSpeed,i.alpha=m,i.vspeed=i.vel.y,i.headingDeg=(Math.atan2(p0(i.quat).x,-p0(i.quat).z)*180/Math.PI+360)%360,i.sweepT=an((i.mach-.3)/.7,0,1),i.sweep+=(20+48*i.sweepT-i.sweep)*(1-Math.exp(-t/.7));const g=.5*l.rho*h*h,y=new G(0,0,0),M=new G(0,0,0);let E=0;if(h>1){const z=Math.abs(m),P=.8*i.flapT,A=i.sweepT;let U;if(z<=so)U=a0+P+l0*m;else{const de=a0+P+l0*so,Pe=Math.max(.35,1-2.2*(z-so));U=Math.sign(m)*de*Pe}const Q=Math.max(0,z-so);let Y=VT-.004*A+GT*(1-.12*A)*U*U;if(Y+=.018*i.gearT+.045*i.flapT+.07*i.sbT+.5*Q,i.mach>.88){const de=an((i.mach-.88)/.17,0,1);Y+=.045*de*de*(3-2*de)}const ie=g*jf,le=ie*U,se=ie*Y,ce=f.clone().divideScalar(h),V=new G(0,1,0).addScaledVector(ce,-ce.y);V.lengthSq()>1e-6?V.normalize():V.set(0,0,-Math.sign(d)||-1),y.addScaledVector(V,le),y.addScaledVector(ce,-se),y.x+=-.8*_*ie;const ue=HT,oe=BT,k=g*jf*ue,ee=g*jf*oe,Fe=1-eA*A,J=(i.trim-.5)*qT,he=e.pitch*(i.stalled?.7:1),Me=.011*an(i.vspeed/12,-1,1)*(1-.75*Math.abs(e.pitch));if(M.x+=k*(J+jT*m+WT*he-XT*(i.omega.x*ue/(2*Math.max(h,30)))-Me),M.z+=ee*($T*_-YT*Fe*e.roll-KT*(i.omega.z*oe/(2*Math.max(h,30)))),M.y+=ee*(JT*_+ZT*e.yaw-QT*(i.omega.y*oe/(2*Math.max(h,30)))),i.stalled=m>so*.92||m<-so*.92,i.stalled&&h>30){const de=i.time;M.x+=k*.012*Math.sin(de*21.3)*Math.sin(de*4.7),M.z+=ee*.02*Math.sin(de*17.7)*Math.sin(de*2.9)}else i.stalled=!1;E=le/mo}else i.stalled=!1;const S=l.sigma;let v=c0+(tA-c0)*i.rpm;v*=Math.pow(S,.75),i.abLevel>.01&&(v+=nA*i.abLevel*Math.pow(S,.6)),y.z-=v;const L=y.applyQuaternion(i.quat);L.y-=mo*Hh;const R=vA(i,t,e,L);i.vel.addScaledVector(L,t/mo),i.pos.addScaledVector(i.vel,t);const T=M.x/r0,B=M.y/s0,I=M.z/o0;i.omega.x=an(i.omega.x+T*t,-1.6,1.6),i.omega.y=an(i.omega.y+B*t,-1,1),i.omega.z=an(i.omega.z+I*t,-3.2,3.2),i.onGround&&i.speed<50&&(i.omega.y+=-e.yaw*1.4*t*(1-i.speed/50));const O=new Ai(i.omega.x*t*.5,i.omega.y*t*.5,i.omega.z*t*.5,1).normalize();if(i.quat.multiply(O).normalize(),R.contacts>0&&(R.torqueBody&&(i.omega.x+=R.torqueBody.x/r0*t,i.omega.y+=R.torqueBody.y/s0*t,i.omega.z+=R.torqueBody.z/o0*t),i.omega.multiplyScalar(Math.exp(-t*3))),i.arresting){const z=new G(i.vel.x,0,i.vel.z),P=z.length();if(P>.01){const A=z.divideScalar(P),U=Math.max(0,P-lA*t);i.vel.set(A.x*U,i.vel.y*.9,A.z*U),U<.5&&(i.vel.set(0,0,0),i.result={kind:"wire",wire:i.wire??3,title:`CAUGHT WIRE ${i.wire??3}`,detail:"Trap confirmed. Nicely done, pilot."})}}i.onGround=R.contacts>0,i.groundKind=R.kind,i.onGround?i.airborne=!1:!i.onGround&&i.pos.y>gA(i)+2.5&&i.flightTime>1&&(i.airborne=!0),i.gLoad=i.onGround?1:E/Hh}function p0(i){return new G(0,0,-1).applyQuaternion(i)}function gA(i){return ud(i.pos.x,i.pos.z).y}function vA(i,e,t,s){const o=i.omega.clone().applyQuaternion(i.quat);let l=0,c=i.groundKind,f=!1,h=0,d=0,m=new G,_=!1,g=!1,y=!1,M=!1;const E=[{...iA,wheel:!0,r:pv,k:mv,c:sA},{...qf,wheel:!0,r:Vh,k:Gh,c:u0},{x:-2.3,y:qf.y,z:qf.z,wheel:!0,r:Vh,k:Gh,c:u0},{x:0,y:Yf,z:-5,wheel:!1,r:0,k:va,c:_a},{x:0,y:Yf,z:.5,wheel:!1,r:0,k:va,c:_a},{x:0,y:-.2,z:6.5,wheel:!1,r:0,k:va,c:_a}];for(const v of E){const L=v.wheel?v.y+(Yf+.05-v.y)*(1-i.gearT)-v.r:v.y,T=new G(v.x,L,v.z).clone().applyQuaternion(i.quat).add(i.pos),B=ud(T.x,T.z),I=B.y-T.y;if(I<=0)continue;l++,c=B.kind,v.wheel&&(d=Math.max(d,I)),B.kind==="deck"?_=!0:B.kind==="runway"?g=!0:B.kind==="terrain"?y=!0:M=!0;const O=T.clone().sub(i.pos),z=i.vel.clone().add(o.clone().cross(O));!v.wheel&&I>.25&&(f=!0);const P=Math.min(rA,Math.max(0,v.k*Math.min(I,.5)-v.c*z.y));if(P>0){const A=new G(0,P,0),U=new G(z.x,0,z.z),Q=U.length();let Y=0;if(Q>.001&&v.wheel){const ie=new G(i.vel.x,0,i.vel.z),le=ie.length();if(le>.001){const se=i.brakeOn?aA:oA,ce=mo/4*(le/e)*.9;Y=Math.min(se*P,ce),A.addScaledVector(ie.clone().divideScalar(le),-Y)}}else Q>.05&&(Y=Math.min(.9*P,mo/4*(Q/e)*.9),A.addScaledVector(U.clone().divideScalar(Q),-Y));if(s.add(A),m.add(O.clone().cross(new G(0,P,0))),Y>0){const ie=new G(O.x,0,O.z),le=U.clone().divideScalar(Q).multiplyScalar(-Y);m.add(ie.cross(le))}}h=Math.min(h,z.y)}const S=l>0&&!i.onGround&&i.airborne;if(i.result||(M&&S?ca(i,"DITCHED","The Tomcat is not a seaplane. Impact with the sea."):f&&S?ca(i,"BELLY IMPACT","Structure hit the ground. Gear was not down (or down hard)."):y&&S?ca(i,"TERRAIN IMPACT","Only the runway and the carrier deck are survivable surfaces."):S&&h<-6&&ca(i,"HARD IMPACT",`Touchdown at ${Math.round(-h*196.85)} fpm — the gear gave way.`)),!i.result&&_&&i.airborne&&i.catCooldown<=0&&h<-.8&&h>-6&&i.speed>20&&i.gearT>.6){const v=lv(i.pos.x,i.pos.z)??cv(i.pos.x,i.pos.z),{s:L,d:R}=pA(v,i.pos.x,i.pos.z);if(Math.abs(R)<=d0&&L>=hA&&L<=dA){const T=an(Math.round((L-fA)/v.wireSpacing)+1,1,v.wireCount);i.arresting=!0,i.wire=T,i.airborne=!1}else Math.abs(R)<=d0?(i.result={kind:"bolter",title:"BOLTER",detail:"Touched the deck but missed the wires. Go around."},i.airborne=!1):ca(i,"DECK STRIKE","Missed the landing area entirely. That will cost you a jet.")}return!i.result&&g&&i.airborne&&h>-6&&(i.banner={text:`TOUCHDOWN — ${Math.round(-h*196.85)} FPM`,until:i.time+3},i.airborne=!1),i.wheelPen=d,{contacts:l,kind:c,torqueBody:m.lengthSq()>0?m.applyQuaternion(i.quat.clone().invert()):null}}function ca(i,e,t){i.result={kind:"crash",title:e,detail:t},i.vel.multiplyScalar(.1),i.omega.multiplyScalar(.2)}const _A=[137,80,78,71,13,10,26,10];async function xA(i){if(i.length<8||_A.some((S,v)=>i[v]!==S))throw new Error("not a PNG");const e=new DataView(i.buffer,i.byteOffset,i.byteLength);let t=0,s=0,o=0,l=0,c=0;const f=[];let h=8;for(;h+12<=i.length;){const S=e.getUint32(h),v=String.fromCharCode(i[h+4],i[h+5],i[h+6],i[h+7]),L=h+8;if(v==="IHDR")t=e.getUint32(L),s=e.getUint32(L+4),o=i[L+8],l=i[L+9],c=i[L+12];else if(v==="IDAT")f.push(i.subarray(L,L+S));else if(v==="IEND")break;h=L+S+4}if(t<=0||s<=0)throw new Error("bad PNG header");if(o!==8)throw new Error(`unsupported PNG bit depth ${o}`);if(c!==0)throw new Error("interlaced PNG not supported");const d=l===0?1:l===2?3:l===4?2:l===6?4:-1;if(d<0)throw new Error(`unsupported PNG colour type ${l}`);const m=await yA(SA(f)),_=t*d;if(m.length<s*(_+1))throw new Error("truncated PNG data");const g=new Uint8Array(t*s*4);let y=new Uint8Array(_),M=new Uint8Array(_),E=0;for(let S=0;S<s;S++){const v=m[E++];M.set(m.subarray(E,E+_)),E+=_,MA(v,M,y,d);for(let R=0;R<t;R++){const T=R*d,B=(S*t+R)*4;if(d===1){const I=M[T];g[B]=I,g[B+1]=I,g[B+2]=I,g[B+3]=255}else if(d===2){const I=M[T];g[B]=I,g[B+1]=I,g[B+2]=I,g[B+3]=M[T+1]}else d===3?(g[B]=M[T],g[B+1]=M[T+1],g[B+2]=M[T+2],g[B+3]=255):(g[B]=M[T],g[B+1]=M[T+1],g[B+2]=M[T+2],g[B+3]=M[T+3])}const L=y;y=M,M=L}return{width:t,height:s,data:g}}async function yA(i){const e=new DecompressionStream("deflate"),t=e.writable.getWriter(),s=(async()=>{await t.write(i),await t.close()})(),o=await new Response(e.readable).arrayBuffer();return await s,new Uint8Array(o)}function SA(i){let e=0;for(const o of i)e+=o.length;const t=new Uint8Array(e);let s=0;for(const o of i)t.set(o,s),s+=o.length;return t}function MA(i,e,t,s){const o=e.length;if(i!==0){if(i===1){for(let l=s;l<o;l++)e[l]=e[l]+e[l-s]&255;return}if(i===2){for(let l=0;l<o;l++)e[l]=e[l]+t[l]&255;return}if(i===3){for(let l=0;l<o;l++){const c=l>=s?e[l-s]:0;e[l]=e[l]+(c+t[l]>>1)&255}return}if(i===4){for(let l=0;l<o;l++){const c=l>=s?e[l-s]:0,f=t[l],h=l>=s?t[l-s]:0;e[l]=e[l]+EA(c,f,h)&255}return}throw new Error(`bad PNG filter ${i}`)}}function EA(i,e,t){const s=i+e-t,o=Math.abs(s-i),l=Math.abs(s-e),c=Math.abs(s-t);return o<=l&&o<=c?i:l<=c?e:t}const m0={id:"kauai",label:"Kauai, Hawaii",attribution:"Terrain & imagery © Mapbox © OpenStreetMap",centerLon:-159.47,centerLat:21.92,zoom:12,satelliteZoom:13,radiusMeters:15e3},sr=40075016686e-3,wA=sr/(2*Math.PI),ai=256;function TA(i){return i*sr/360}function AA(i){const e=i*Math.PI/180;return wA*Math.log(Math.tan(Math.PI/4+e/2))}function _v(i,e){const t=Math.cos(i.centerLat*Math.PI/180),s=TA(i.centerLon),o=AA(i.centerLat),l=2**e,c=sr/l,f=i.radiusMeters/t,h=(.5+(s-f)/sr)*l,d=(.5+(s+f)/sr)*l,m=(.5-(o+f)/sr)*l,_=(.5-(o-f)/sr)*l,g=Math.max(0,Math.floor(h)),y=Math.max(g,Math.min(l-1,Math.ceil(d)-1)),M=Math.max(0,Math.floor(m)),E=Math.max(M,Math.min(l-1,Math.ceil(_)-1)),S=y-g+1,v=E-M+1,L=S*ai,R=v*ai,T=c/ai*t,B=((g/l-.5)*sr-s)*t,I=(o-sr*(.5-M/l))*t;return{z:e,tx0:g,ty0:M,nx:S,ny:v,widthPx:L,heightPx:R,cellSize:T,worldX0:B,worldZ0:I,worldW:L*T,worldH:R*T}}function CA(i,e,t,s,o){return`https://api.mapbox.com/v4/mapbox.terrain-rgb/${e}/${t}/${s}.pngraw?access_token=${o}`}function RA(i,e,t,s,o){return`https://api.mapbox.com/v4/mapbox.satellite/${e}/${t}/${s}.jpg?access_token=${o}`}async function PA(i,e,t=i.zoom){const s=_v(i,t),o=new Float32Array(s.widthPx*s.heightPx),l=[];for(let g=0;g<s.ny;g++)for(let y=0;y<s.nx;y++)l.push((async()=>{const M=s.tx0+y,E=s.ty0+g,S=await fetch(CA(i,t,M,E,e));if(!S.ok)throw new Error(`terrain tile ${t}/${M}/${E}: HTTP ${S.status}`);const v=await xA(new Uint8Array(await S.arrayBuffer()));if(v.width!==ai||v.height!==ai)throw new Error(`terrain tile ${t}/${M}/${E}: unexpected ${v.width}x${v.height}`);for(let L=0;L<ai;L++){const R=(g*ai+L)*s.widthPx+y*ai;for(let T=0;T<ai;T++){const B=(L*ai+T)*4;o[R+T]=-1e4+(v.data[B]*65536+v.data[B+1]*256+v.data[B+2])*.1}}})());await Promise.all(l);const{cellSize:c,worldX0:f,worldZ0:h}=s,d=s.widthPx,m=s.heightPx;return{width:d,height:m,cellSize:c,worldX0:f,worldZ0:h,heights:o,sample:(g,y)=>{const M=Math.max(0,Math.min(d-1,(g-f)/c-.5)),E=Math.max(0,Math.min(m-1,(y-h)/c-.5)),S=Math.floor(M),v=Math.floor(E),L=Math.min(S+1,d-1),R=Math.min(v+1,m-1),T=M-S,B=E-v,I=o[v*d+S]*(1-T)+o[v*d+L]*T,O=o[R*d+S]*(1-T)+o[R*d+L]*T;return I*(1-B)+O*B}}}async function bA(i,e,t=i.satelliteZoom){if(typeof document>"u")throw new Error("satellite loader needs a DOM");const s=_v(i,t),o=document.createElement("canvas");o.width=s.widthPx,o.height=s.heightPx;const l=o.getContext("2d");if(!l)throw new Error("no 2d context");const c=[];for(let f=0;f<s.ny;f++)for(let h=0;h<s.nx;h++)c.push((async()=>{const d=s.tx0+h,m=s.ty0+f,_=await fetch(RA(i,t,d,m,e));if(!_.ok)throw new Error(`satellite tile ${t}/${d}/${m}: HTTP ${_.status}`);const g=await createImageBitmap(await _.blob());l.drawImage(g,h*ai,f*ai),g.close()})());return await Promise.all(c),{canvas:o,worldX0:s.worldX0,worldZ0:s.worldZ0,worldW:s.worldW,worldH:s.worldH}}const oo=1/120;function LA(){return{speedKt:0,altFt:0,mach:0,headingDeg:0,aoaDeg:0,vsFpm:0,gLoad:1,throttlePct:0,rpmPct:0,ab:0,gear:!0,flaps:!1,speedbrake:!1,trim:.5,sweepDeg:20,stalled:!1,onGround:!0,catPhase:"ready",catProgress:0,pitchDeg:0,rollDeg:0,cameraMode:"chase",flightTime:0,distCarrierKm:0,bearingCarrierDeg:0,carrierName:"—",distFieldKm:0,bearingFieldDeg:0,worldLabel:"Procedural islands",worldAttribution:null,radarAltFt:0}}class DA{constructor(e,t){Le(this,"phase","menu");Le(this,"renderer");Le(this,"rig",new FT);Le(this,"audio",new OT);Le(this,"input");Le(this,"settings");Le(this,"state");Le(this,"mission","carrier");Le(this,"acc",0);Le(this,"last",0);Le(this,"raf",0);Le(this,"prevPos",new G);Le(this,"prevQuat",new Ai);Le(this,"hud",LA());Le(this,"hudListeners",new Set);Le(this,"phaseListeners",new Set);Le(this,"lastHudNotify",0);Le(this,"worldId","archipelago");Le(this,"worldState",{status:"ready",id:"archipelago"});Le(this,"worldListeners",new Set);Le(this,"spawnCarrier",0);Le(this,"nextCarrier",0);Le(this,"onResize",()=>this.renderer.resize());Le(this,"inputPitch",0);Le(this,"inputRoll",0);Le(this,"inputYaw",0);Le(this,"loop",e=>{this.raf=requestAnimationFrame(this.loop);const t=e/1e3,s=Math.min(.05,Math.max(1e-4,t-this.last));if(this.phase==="flying"){this.last=t,this.handleEdges();const o=this.input.sample(oo);this.inputPitch=o.pitch,this.inputRoll=o.roll,this.inputYaw=o.yaw,this.stepSim(o,s)}else this.phase==="paused"?(this.last=t,this.input.take("pause")&&this.resume()):this.phase==="result"&&(this.last=t,this.input.take("pause"),this.updateJetPose(1),this.updateAudio());this.updateCamera((this.phase==="flying",s)),this.updateSun(),this.renderer.render()});this.settings=t,this.renderer=new NT(e,t.quality,{height:Bh,style:"island",texture:null}),this.renderer.applyQuality(t.quality),this.input=new kT(t),this.input.attach(e),window.addEventListener("resize",this.onResize),this.state=ac("carrier"),this.updateJetPose(1),this.updateHud(),this.raf=requestAnimationFrame(this.loop)}applySettings(e){const t=e.quality!==this.settings.quality;this.settings=e,this.input.applySettings(e),this.audio.setVolume(e.volume),t&&this.renderer.applyQuality(e.quality)}startMission(e){e==="carrier"&&(this.spawnCarrier=this.nextCarrier,this.nextCarrier=(this.nextCarrier+1)%Ec().length),this.beginMission(e,this.spawnCarrier)}beginMission(e,t){this.mission=e,this.state=ac(e,t),this.prevPos.copy(this.state.pos),this.prevQuat.copy(this.state.quat),this.setPhase("flying"),this.acc=0,this.last=performance.now()/1e3,this.input.clearEdges(),this.audio.start(),this.audio.resume(),this.updateHud()}resume(){this.phase==="paused"&&(this.setPhase("flying"),this.last=performance.now()/1e3,this.input.clearEdges()),this.audio.resume()}pause(){this.phase==="flying"&&this.setPhase("paused")}restart(){this.beginMission(this.mission,this.spawnCarrier)}quitToMenu(){this.state=ac(this.mission,this.spawnCarrier),this.updateJetPose(1),this.audio.update(.05,0,0,!1,!0),this.setPhase("menu")}cycleCamera(){this.rig.cycle()}setCameraMode(e){this.rig.mode=e}setPhase(e){this.phase=e;for(const t of this.phaseListeners)t(e)}subscribePhase(e){return this.phaseListeners.add(e),e(this.phase),()=>{this.phaseListeners.delete(e)}}get snapshot(){return this.hud}subscribeHud(e){return this.hudListeners.add(e),e(this.hud),()=>{this.hudListeners.delete(e)}}subscribeWorld(e){return this.worldListeners.add(e),e(this.worldState),()=>{this.worldListeners.delete(e)}}get worldStateSnapshot(){return this.worldState}async setWorldKind(e){if(e===this.worldId&&this.worldState.status==="ready")return null;if(e==="archipelago")return Zg(),this.worldId="archipelago",this.renderer.applyWorld(this.paint(null)),this.setWorldState({status:"ready",id:"archipelago"}),this.afterWorldChange(),null;this.setWorldState({status:"loading",id:e});try{const t="pk.eyJ1IjoiZGFuaWxvd2UyOCIsImEiOiJjbXVxYXdoN2QwNG92MnpxMXlsdTN4eTR4In0.1lpdKhIQm6EgRwNEob2nmw",s=await PA(m0,t);uT(zh,dT(s));let o=null;try{o=await bA(m0,t)}catch{o=null}return this.worldId="kauai",this.renderer.applyWorld(this.paint(o)),this.setWorldState({status:"ready",id:"kauai"}),this.afterWorldChange(),null}catch(t){const s=t instanceof Error?t.message:String(t);return Zg(),this.worldId="archipelago",this.renderer.applyWorld(this.paint(null)),this.setWorldState({status:"error",id:"archipelago",error:`Couldn't load Mapbox terrain (${s}) — staying on the procedural islands.`}),this.afterWorldChange(),s}}paint(e){const t=Bf();return{height:Bh,style:t.id==="kauai"?"tropical":"island",texture:e}}setWorldState(e){this.worldState=e;for(const t of this.worldListeners)t(e)}afterWorldChange(){this.state=ac(this.mission,this.spawnCarrier),this.prevPos.copy(this.state.pos),this.prevQuat.copy(this.state.quat),this.updateJetPose(1),this.updateHud()}dispose(){cancelAnimationFrame(this.raf),window.removeEventListener("resize",this.onResize),this.input.detach(),this.audio.dispose(),this.renderer.renderer.dispose()}handleEdges(){if(this.input.take("pause")){this.pause();return}this.input.take("camera")&&this.rig.cycle(),this.input.take("gear")&&(this.state.onGround&&this.state.speed<1?this.pushBanner("GEAR LOCKED — cannot retract while parked"):this.state.gearDown=!this.state.gearDown),this.input.take("flaps")&&(this.state.flapsDown=!this.state.flapsDown),this.input.take("speedbrake")&&(this.state.speedbrake=!this.state.speedbrake),this.input.take("ab")&&(this.state.abOn=!this.state.abOn),this.input.take("cat")}stepSim(e,t){this.acc=Math.min(this.acc+t,.25);let s=0;for(;this.acc>=oo&&s<8;)this.prevPos.copy(this.state.pos),this.prevQuat.copy(this.state.quat),mA(this.state,e,oo),this.acc-=oo,s++;this.state.result&&this.phase==="flying"&&this.setPhase("result");const o=s>0?lr.clamp(this.acc/oo,0,1):1;this.updateJetPose(o),this.updateAudio(),this.updateHud()}updateJetPose(e){const t=this.state,s=this.renderer.jetGroup;s.position.lerpVectors(this.prevPos,t.pos,e);const o=this.prevQuat.clone().slerp(t.quat,e);s.quaternion.copy(o),s.userData.elevator=-this.inputPitch*.6,s.userData.aileron=this.inputRoll*.5,s.userData.rudder=this.inputYaw*.5,UT(this.renderer.jet,t)}updateCamera(e){var f;const t=this.state,s=lr.clamp(this.acc/oo,0,1),o=new G().lerpVectors(this.prevPos,t.pos,s),l=this.prevQuat.clone().slerp(t.quat,s),c=this.input.takeMouse();this.rig.mouse(c.dx,c.dy),this.rig.update(this.renderer.camera,o,l,t.speed,e),this.renderer.jetGroup.visible=this.rig.mode!=="cockpit"||this.phase==="menu",this.phase==="menu"&&(this.rig.mode="orbit"),this.phase==="result"&&((f=t.result)==null?void 0:f.kind)==="crash"&&(this.rig.mode="orbit")}updateAudio(){const e=this.state;this.audio.update(e.rpm,e.abLevel,e.speed,e.stalled&&!e.onGround,this.phase!=="flying")}updateSun(){const e=this.state.pos;this.renderer.sun.position.set(e.x+4e3,e.y+5500,e.z+1500);const t=this.renderer.sun.target;t.position.copy(e),t.updateMatrixWorld(),this.renderer.scene.children.includes(t)||this.renderer.scene.add(t)}pushBanner(e){this.state.banner={text:e,until:this.state.time+3}}updateHud(){var S,v,L;const e=this.state,t=new G(0,0,-1).applyQuaternion(e.quat),s=new G(1,0,0).applyQuaternion(e.quat),o=Math.asin(lr.clamp(t.y,-1,1))*(180/Math.PI),l=Math.asin(lr.clamp(s.y,-1,1))*(180/Math.PI),c=e.pos.y-this.groundRef(e),f=cd(),h=cv(e.pos.x,e.pos.z),d=h.x-e.pos.x,m=h.z-e.pos.z,_=f.centerX-e.pos.x,g=f.centerZ-e.pos.z,y=Math.atan2(d,-m)*180/Math.PI,M=Math.atan2(_,-g)*180/Math.PI;this.hud={speedKt:e.speed*1.94384,altFt:e.pos.y*3.28084,mach:e.mach,headingDeg:e.headingDeg,aoaDeg:e.alpha*57.2958,vsFpm:e.vspeed*196.85,gLoad:e.gLoad,throttlePct:Math.round(e.throttle*100),rpmPct:Math.round(e.rpm*100),ab:e.abLevel,gear:e.gearDown&&e.gearT>.95,flaps:e.flapsDown&&e.flapT>.95,speedbrake:e.speedbrake&&e.sbT>.95,trim:e.trim,sweepDeg:Math.round(20+48*e.sweepT),stalled:e.stalled,onGround:e.onGround,catPhase:e.catPhase,catProgress:e.catProgress,pitchDeg:o,rollDeg:l,cameraMode:this.rig.mode,wire:e.wire,resultTitle:(S=e.result)==null?void 0:S.title,resultDetail:(v=e.result)==null?void 0:v.detail,resultKind:(L=e.result)==null?void 0:L.kind,banner:e.banner&&e.time<e.banner.until?e.banner.text:void 0,radarAltFt:c*3.28084,flightTime:e.flightTime,distCarrierKm:Math.hypot(d,m)/1e3,bearingCarrierDeg:(y+360)%360,carrierName:h.name,distFieldKm:Math.hypot(_,g)/1e3,bearingFieldDeg:(M+360)%360,worldLabel:Bf().label,worldAttribution:Bf().attribution};const E=performance.now();if(E-this.lastHudNotify>50){this.lastHudNotify=E;for(const R of this.hudListeners)R(this.hud)}}groundRef(e){return ud(e.pos.x,e.pos.z).y}}function xv(i){const e=t=>i?i.subscribeHud(()=>t()):()=>{};return Ln.useSyncExternalStore(e,()=>i?i.snapshot:null,()=>null)??NA}const NA={speedKt:0,altFt:0,mach:0,headingDeg:0,aoaDeg:0,vsFpm:0,gLoad:1,throttlePct:0,rpmPct:0,ab:0,gear:!0,flaps:!1,speedbrake:!1,trim:.5,sweepDeg:20,stalled:!1,onGround:!0,catPhase:"ready",catProgress:0,pitchDeg:0,rollDeg:0,cameraMode:"chase",flightTime:0,distCarrierKm:0,bearingCarrierDeg:0,carrierName:"—",distFieldKm:0,bearingFieldDeg:0,worldLabel:"Procedural islands",worldAttribution:null,radarAltFt:0};function IA({game:i}){const e=xv(i);return fe.jsxs("div",{className:"hud-root",children:[fe.jsx(FA,{hud:e}),fe.jsxs("div",{className:"hud-left",children:[fe.jsx(ir,{label:"AIRSPEED",value:Math.round(e.speedKt),unit:"KT",big:!0}),fe.jsx(ir,{label:"MACH",value:e.mach.toFixed(2)}),fe.jsx(ir,{label:"AOA",value:e.aoaDeg.toFixed(1),unit:"°",warn:Math.abs(e.aoaDeg)>13}),fe.jsx(ir,{label:"G",value:e.gLoad.toFixed(1),warn:e.gLoad>7.5||e.gLoad<-1})]}),fe.jsxs("div",{className:"hud-right",children:[fe.jsx(ir,{label:"ALT",value:Math.round(e.altFt).toLocaleString(),unit:"FT",big:!0}),fe.jsx(ir,{label:"RALT",value:Math.round(e.radarAltFt).toLocaleString(),unit:"FT",warn:e.radarAltFt<500}),fe.jsx(ir,{label:"V/S",value:(e.vsFpm>0?"+":"")+Math.round(e.vsFpm),unit:"FPM"}),fe.jsx(ir,{label:"HDG",value:String(Math.round(e.headingDeg)).padStart(3,"0"),unit:"°"}),fe.jsx(ir,{label:"W-SWEEP",value:String(e.sweepDeg),unit:"°"})]}),fe.jsxs("div",{className:"hud-bottom",children:[fe.jsxs("div",{className:"hud-eng",children:[fe.jsx(UA,{pct:e.throttlePct,ab:e.ab}),fe.jsxs("span",{className:"hud-rpm",children:["RPM ",e.rpmPct,"%"]})]}),fe.jsxs("div",{className:"hud-toggles",children:[fe.jsx(lc,{on:e.gear,text:"GEAR",warn:!e.gear&&!e.onGround}),fe.jsx(lc,{on:e.flaps,text:"FLAPS"}),fe.jsx(lc,{on:e.speedbrake,text:"S-BRAKE"}),fe.jsx(lc,{on:e.trim>.52||e.trim<.48,text:"TRIM"})]}),fe.jsxs("div",{className:"hud-nav",children:[fe.jsxs("div",{children:["CARRIER ",e.carrierName," · ",e.distCarrierKm.toFixed(1)," KM · ",Math.round(e.bearingCarrierDeg),"°"]}),fe.jsxs("div",{children:["FIELD ",e.distFieldKm.toFixed(1)," KM · ",Math.round(e.bearingFieldDeg),"°"]}),fe.jsxs("div",{className:"hud-cam",children:[e.cameraMode.toUpperCase()," CAM · C to cycle"]})]})]}),e.stalled&&fe.jsx("div",{className:"hud-stall",children:"STALL"}),e.catPhase==="ready"&&fe.jsx("div",{className:"hud-cat ready",children:"HOLD [SPACE] — CATAPULT LAUNCH"}),e.catPhase==="charging"&&fe.jsxs("div",{className:"hud-cat charging",children:["CAT TENSION ",Math.round(e.catProgress*100),"%"]}),e.ab>.05&&fe.jsx("div",{className:"hud-ab",children:"AB"}),e.banner&&fe.jsx("div",{className:"hud-banner",children:e.banner}),e.worldAttribution&&fe.jsx("div",{className:"hud-credit",children:e.worldAttribution})]})}function ir({label:i,value:e,unit:t,big:s,warn:o}){return fe.jsxs("div",{className:"hud-gauge"+(s?" big":"")+(o?" warn":""),children:[fe.jsx("span",{className:"hud-gauge-label",children:i}),fe.jsxs("span",{className:"hud-gauge-value",children:[e,t?fe.jsx("em",{children:t}):null]})]})}function UA({pct:i,ab:e}){return fe.jsxs("div",{className:"hud-throttle",children:[fe.jsx("div",{className:"hud-throttle-fill",style:{width:`${i}%`}}),e>.05&&fe.jsx("div",{className:"hud-throttle-ab",style:{width:`${Math.min(100,i*.6)}%`}}),fe.jsxs("span",{children:["THR ",i,"%",e>.05?" AB":""]})]})}function lc({on:i,text:e,warn:t}){return fe.jsx("span",{className:"hud-tag"+(i?" on":"")+(t?" warn":""),children:e})}function FA({hud:i}){const e=Ln.useRef(null);return Ln.useEffect(()=>{let t=0;const s=()=>{t=requestAnimationFrame(s);const o=e.current;if(!o)return;const l=Math.min(window.devicePixelRatio,2),c=o.clientWidth,f=o.clientHeight;(o.width!==c*l||o.height!==f*l)&&(o.width=c*l,o.height=f*l);const h=o.getContext("2d");if(!h)return;h.setTransform(l,0,0,l,0,0),h.clearRect(0,0,c,f);const d=c/2,m=f/2,_=Math.min(7,f/90),g=i.rollDeg*Math.PI/180;h.save(),h.translate(d,m),h.rotate(-g),h.strokeStyle="rgba(120,255,140,0.9)",h.fillStyle="rgba(120,255,140,0.9)",h.lineWidth=1.5,h.font="11px monospace";const y=i.pitchDeg*_;h.beginPath(),h.moveTo(-c*.32,y),h.lineTo(-40,y),h.moveTo(40,y),h.lineTo(c*.32,y),h.stroke();for(let S=1;S<=3;S++){const v=y+S*10*_,L=28+S*6;h.beginPath(),h.moveTo(-L,v),h.lineTo(L,v),h.stroke()}for(let S=-90;S<=90;S+=10){if(S===0)continue;const v=y-S*_;if(Math.abs(v)>f*.48)continue;const L=34;h.beginPath(),h.moveTo(-L,v),h.lineTo(-8,v),h.moveTo(8,v),h.lineTo(L,v),h.stroke(),h.fillText(String(S),L+6,v+4),h.fillText(String(S),-L-22,v+4)}h.restore(),h.strokeStyle="rgba(255,220,80,0.95)",h.lineWidth=2,h.beginPath(),h.moveTo(d-26,m),h.lineTo(d-8,m),h.lineTo(d-4,m+6),h.lineTo(d+4,m+6),h.lineTo(d+8,m),h.lineTo(d+26,m),h.stroke();const M=Math.atan2(i.vsFpm/196.85,Math.max(i.speedKt/1.94384,8))*(180/Math.PI),E=m-(i.pitchDeg-M)*_;h.strokeStyle="rgba(120,255,140,0.95)",h.beginPath(),h.arc(d,E,5,0,Math.PI*2),h.stroke(),h.beginPath(),h.moveTo(d-12,E),h.lineTo(d-5,E),h.moveTo(d+5,E),h.lineTo(d+12,E),h.moveTo(d,E-8),h.lineTo(d,E-5),h.stroke()};return t=requestAnimationFrame(s),()=>cancelAnimationFrame(t)},[i]),fe.jsx("canvas",{ref:e,className:"hud-ladder"})}function OA(i){const e=t=>i?i.subscribePhase(()=>t()):()=>{};return Ln.useSyncExternalStore(e,()=>i?i.phase:"menu",()=>"menu")}const g0={status:"ready",id:"archipelago"};function kA(i){const e=t=>i?i.subscribeWorld(()=>t()):()=>{};return Ln.useSyncExternalStore(e,()=>i?i.worldStateSnapshot:g0,()=>g0)}function zA({game:i,settings:e,onSettings:t}){const s=OA(i);return fe.jsxs(fe.Fragment,{children:[s==="menu"&&fe.jsx(BA,{game:i,settings:e,onSettings:t}),s!=="menu"&&fe.jsx(IA,{game:i}),s==="paused"&&i&&fe.jsx(HA,{game:i,settings:e,onSettings:t}),s==="result"&&i&&fe.jsx(VA,{game:i})]})}function Gn({children:i,onClick:e,primary:t}){return fe.jsx("button",{className:"menu-btn"+(t?" primary":""),onClick:e,children:i})}function BA({game:i,settings:e,onSettings:t}){const[s,o]=Ln.useState("main"),l=kA(i),[c,f]=Ln.useState(!1),h=c||l.status==="loading",d=async m=>{if(!i||h||m===l.id)return;f(!0),await i.setWorldKind(m)||t({...e,world:m}),f(!1)};return fe.jsxs("div",{className:"ui-root menu-bg",children:[fe.jsxs("div",{className:"menu-panel",children:[fe.jsxs("div",{className:"menu-title",children:[fe.jsx("span",{className:"menu-kicker",children:"VF-84 JOLLY ROGERS"}),fe.jsx("h1",{children:"F-14 TOMCAT"}),fe.jsx("span",{className:"menu-sub",children:"CARRIER FLIGHT SIMULATOR"})]}),s==="main"&&fe.jsxs(fe.Fragment,{children:[fe.jsxs("div",{className:"menu-buttons",children:[fe.jsx(Gn,{primary:!0,onClick:()=>i==null?void 0:i.startMission("carrier"),children:"CAT SHOT — CARRIER LAUNCH"}),fe.jsx(Gn,{onClick:()=>i==null?void 0:i.startMission("airfield"),children:"RUNWAY — ISLAND AIRFIELD"}),fe.jsx(Gn,{onClick:()=>o("settings"),children:"SETTINGS"}),fe.jsx(Gn,{onClick:()=>o("controls"),children:"CONTROLS"})]}),fe.jsxs("div",{className:"menu-world",children:[fe.jsx("span",{className:"menu-world-label",children:"WORLD"}),fe.jsxs("div",{className:"menu-world-chips",children:[fe.jsx("button",{className:"world-chip"+(l.id==="archipelago"?" on":""),disabled:h,onClick:()=>void d("archipelago"),children:"PROCEDURAL ISLANDS"}),fe.jsx("button",{className:"world-chip"+(l.id==="kauai"?" on":""),disabled:h,onClick:()=>void d("kauai"),children:"KAUAI · LIVE MAPBOX TERRAIN"})]}),l.status==="loading"&&fe.jsx("div",{className:"menu-world-note",children:"Fetching Mapbox terrain & satellite imagery…"}),l.status==="error"&&fe.jsx("div",{className:"menu-world-note err",children:l.error}),l.id==="kauai"&&l.status==="ready"&&fe.jsx("div",{className:"menu-world-credit",children:"Terrain & imagery © Mapbox © OpenStreetMap"})]})]}),s==="settings"&&fe.jsx(yv,{settings:e,onSettings:t,onBack:()=>o("main")}),s==="controls"&&fe.jsx(Sv,{settings:e,onSettings:t,onBack:()=>o("main")})]}),fe.jsx("div",{className:"menu-footer",children:"Mouse drag — look around · C — camera · ESC — pause"})]})}function HA({game:i,settings:e,onSettings:t}){const[s,o]=Ln.useState("main");return fe.jsx("div",{className:"ui-root pause-bg",children:fe.jsxs("div",{className:"menu-panel small",children:[fe.jsx("h2",{className:"menu-h2",children:"PAUSED"}),s==="main"&&fe.jsxs("div",{className:"menu-buttons",children:[fe.jsx(Gn,{primary:!0,onClick:()=>i.resume(),children:"RESUME"}),fe.jsx(Gn,{onClick:()=>i.restart(),children:"RESTART FLIGHT"}),fe.jsx(Gn,{onClick:()=>o("settings"),children:"SETTINGS"}),fe.jsx(Gn,{onClick:()=>o("controls"),children:"CONTROLS"}),fe.jsx(Gn,{onClick:()=>i.quitToMenu(),children:"QUIT TO MENU"})]}),s==="settings"&&fe.jsx(yv,{settings:e,onSettings:t,onBack:()=>o("main")}),s==="controls"&&fe.jsx(Sv,{settings:e,onSettings:t,onBack:()=>o("main")})]})})}function VA({game:i}){const e=xv(i);if(!e.resultTitle)return null;const t=e.resultKind;return fe.jsx("div",{className:"ui-root result-bg "+(t??""),children:fe.jsxs("div",{className:"result-panel",children:[fe.jsx("h2",{className:"result-title "+(t??""),children:e.resultTitle}),fe.jsx("p",{className:"result-detail",children:e.resultDetail}),e.resultKind==="wire"&&fe.jsxs("p",{className:"result-sub",children:["Flight time ",e.flightTime.toFixed(0)," s · Wire ",e.wire]}),fe.jsxs("div",{className:"menu-buttons",children:[fe.jsx(Gn,{primary:!0,onClick:()=>i.restart(),children:"FLY AGAIN"}),fe.jsx(Gn,{onClick:()=>i.quitToMenu(),children:"QUIT TO MENU"})]}),fe.jsx("p",{className:"result-hint",children:"Choose a button, pilot."})]})})}function yv({settings:i,onSettings:e,onBack:t}){const s=o=>e({...i,...o});return fe.jsxs("div",{className:"menu-screen",children:[fe.jsx("h3",{className:"menu-h3",children:"SETTINGS"}),fe.jsxs("label",{className:"menu-row",children:[fe.jsx("span",{children:"Graphics quality"}),fe.jsxs("select",{value:i.quality,onChange:o=>s({quality:o.target.value}),children:[fe.jsx("option",{value:"low",children:"Low"}),fe.jsx("option",{value:"medium",children:"Medium"}),fe.jsx("option",{value:"high",children:"High"})]})]}),fe.jsxs("label",{className:"menu-row",children:[fe.jsx("span",{children:"Volume"}),fe.jsx("input",{type:"range",min:0,max:1,step:.05,value:i.volume,onChange:o=>s({volume:Number(o.target.value)})})]}),fe.jsxs("label",{className:"menu-row",children:[fe.jsx("span",{children:"Control sensitivity"}),fe.jsx("input",{type:"range",min:.4,max:1.5,step:.05,value:i.sensitivity,onChange:o=>s({sensitivity:Number(o.target.value)})})]}),fe.jsx(Gn,{onClick:t,children:"BACK"})]})}function Sv({settings:i,onSettings:e,onBack:t}){const[s,o]=Ln.useState(null);Ln.useEffect(()=>{if(!s)return;const c=f=>{f.preventDefault(),f.code!=="Escape"&&e({...i,bindings:{...i.bindings,[s]:f.code}}),o(null)};return window.addEventListener("keydown",c,{once:!0}),()=>window.removeEventListener("keydown",c)},[s,i,e]);const l=Object.keys(Jg);return fe.jsxs("div",{className:"menu-screen",children:[fe.jsx("h3",{className:"menu-h3",children:"CONTROLS"}),fe.jsx("div",{className:"bindings-grid",children:l.map(c=>fe.jsxs("button",{className:"binding"+(s===c?" capturing":""),onClick:()=>o(c),children:[fe.jsx("span",{children:Jg[c]}),fe.jsx("kbd",{children:s===c?"press a key…":_T(i.bindings[c])})]},c))}),fe.jsx("p",{className:"menu-note",children:"Mouse: drag to look around (chase & orbit cameras)."}),fe.jsxs("div",{className:"menu-row-btns",children:[fe.jsx(Gn,{onClick:()=>e({...i,bindings:{...hv}}),children:"RESET DEFAULTS"}),fe.jsx(Gn,{onClick:t,children:"BACK"})]})]})}function GA(){const i=Ln.useRef(null),[e,t]=Ln.useState(null),[s,o]=Ln.useState(()=>vT());Ln.useEffect(()=>{if(!i.current)return;const c=new DA(i.current,s);t(c);let f=!1;return s.world!=="archipelago"&&c.setWorldKind(s.world).then(h=>{f||!h||o(d=>{const m={...d,world:"archipelago"};return e0(m),m})}),()=>{f=!0,c.dispose()}},[]);const l=c=>{o(c),e0(c),e==null||e.applySettings(c)};return fe.jsxs("div",{className:"app",children:[fe.jsx("canvas",{ref:i,className:"game-canvas"}),fe.jsx(zA,{game:e,settings:s,onSettings:l})]})}ux.createRoot(document.getElementById("root")).render(fe.jsx(Ln.StrictMode,{children:fe.jsx(GA,{})}));
