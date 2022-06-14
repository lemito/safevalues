/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This contains safe wrappers for properties that aren't specific
 * to one kind of HTMLElement (like innerHTML), plus other setters and functions
 * that are not tied to elements (like location.href or Worker constructor).
 */

import {SafeAttributePrefix, SafeHtml, SafeStyle, unwrapAttributePrefix, unwrapHtml, unwrapStyle} from '../../index';

/**
 * Safely set {@link Element.innerHTML} on a given ShadowRoot or Element which
 * may not be a `<script>` element or a `<style>` element.
 */
export function setInnerHtml<T extends Element|ShadowRoot>(
    elOrRoot: Exclude<T, HTMLScriptElement|HTMLStyleElement>, v: SafeHtml) {
  if (isElement(elOrRoot)) {
    throwIfScriptOrStyle(elOrRoot);
  }
  elOrRoot.innerHTML = unwrapHtml(v);
}

/**
 * Safely set {@link Element.outerHTML} for the given Element.
 */
export function setOuterHtml(e: Element, v: SafeHtml) {
  const parent = e.parentElement;
  if (parent !== null) {
    throwIfScriptOrStyle(parent);
  }
  e.outerHTML = unwrapHtml(v);
}

/**
 * Set `ElementCSSInlineStyle.cssText` for the given `ElementCSSInlineStyle`.
 */
export function setCssText(e: ElementCSSInlineStyle, v: SafeStyle) {
  e.style.cssText = unwrapStyle(v);
}

/**
 * Safely call {@link Element.insertAdjacentHTML} for the given Element.
 */
export function insertAdjacentHtml<T extends Element>(
    element: Exclude<T, HTMLScriptElement|HTMLStyleElement>,
    position: 'afterbegin'|'afterend'|'beforebegin'|'beforeend', v: SafeHtml) {
  const tagContext = (position === 'beforebegin' || position === 'afterend') ?
      element.parentElement :
      element;
  if (tagContext !== null) {
    throwIfScriptOrStyle(tagContext);
  }
  element.insertAdjacentHTML(position, unwrapHtml(v));
}

/**
 * Given a set of known-to-be-safe prefixes (e.g., "data-", "aria-", "js"),
 * return a setter function that allows you to set attributes on an element,
 * as long as the names of the attributes to be set has one of the prefixes.
 *
 * The returned setter ensures that setting any dangerous attribute, e.g.,
 * "src", "href" will cause an exception. This is intended to be used as the
 * safe alterantive of `Element#setAttribute`, when applications need to set
 * attributes that do not have security implications and do not have a
 * corresponding DOM property.
 */
export function buildPrefixedAttributeSetter(
    prefix: SafeAttributePrefix,
    ...otherPrefixes: readonly SafeAttributePrefix[]) {
  const prefixes = [prefix, ...otherPrefixes];

  return (e: Element, attr: string, value: string) => {
    setPrefixedAttribute(prefixes, e, attr, value);
  };
}

/**
 * The safe alternative to Element#setAttribute. The function takes a list of
 * `SafeAttributePrefix`, making developer intention explicit. The attribute
 * to be set must has one of the safe prefixes, otherwise the function throws
 * an Error.
 */
export function setPrefixedAttribute(
    attrPrefixes: readonly SafeAttributePrefix[], e: Element, attr: string,
    value: string) {
  if (attrPrefixes.length === 0) {
    throw new Error('No prefixes are provided');
  }
  const prefixes = attrPrefixes.map(s => unwrapAttributePrefix(s));
  const attrLower = attr.toLowerCase();
  if (prefixes.every(p => attrLower.indexOf(p) !== 0)) {
    throw new Error(
        `Attribute "${attr}" does not match any of the allowed prefixes.`);
  }
  e.setAttribute(attr, value);
}

function throwIfScriptOrStyle(element: Element): void {
  if (element.tagName.toLowerCase() === 'script') {
    throw new Error('Use setTextContent with a SafeScript.');
  } else if (element.tagName.toLowerCase() === 'style') {
    throw new Error('Use setTextContent with a SafeStyleSheet.');
  }
}

function isElement(elOrRoot: Element|ShadowRoot): elOrRoot is Element {
  return (elOrRoot as Element).tagName !== undefined;
}
