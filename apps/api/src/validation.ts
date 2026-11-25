import { DomainError } from './types.ts';
import { isIndianPin } from './serviceability.ts';
export type Body=Record<string,unknown>;
export function object(value:unknown):Body {if(!value||typeof value!=='object'||Array.isArray(value))throw new DomainError(422,'VALIDATION','A JSON object is required.');return value as Body;}
export function text(body:Body,key:string,max=500,min=1):string {const value=body[key];if(typeof value!=='string'||value.trim().length<min||value.length>max)throw new DomainError(422,'VALIDATION',`${key} must be text between ${min} and ${max} characters.`);return value.trim();}
export function number(body:Body,key:string,max=1e7,min=0.001):number {const value=body[key];if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new DomainError(422,'VALIDATION',`${key} must be a number between ${min} and ${max}.`);return value;}
export function integer(body:Body,key:string,max=1e7,min=1):number {const value=number(body,key,max,min);if(!Number.isSafeInteger(value))throw new DomainError(422,'VALIDATION',`${key} must be a whole number.`);return value;}
export function choice<T extends string>(body:Body,key:string,values:readonly T[]):T {const value=body[key];if(typeof value!=='string'||!values.includes(value as T))throw new DomainError(422,'VALIDATION',`${key} must be one of: ${values.join(', ')}.`);return value as T;}
export function pin(body:Body,key='pin') {const value=text(body,key,6,6);if(!isIndianPin(value))throw new DomainError(422,'VALIDATION','Enter a six-digit Indian PIN code starting with 1–9.');return value;}
export function list(body:Body,key:string,max=50):unknown[] {const value=body[key];if(!Array.isArray(value)||value.length>max)throw new DomainError(422,'VALIDATION',`${key} must be an array of at most ${max} items.`);return value;}
export const units=['kg','gram','quintal','tonne','litre','piece','box','bag','crate'] as const;
export function iso(body:Body,key:string) {const value=text(body,key,64);if(Number.isNaN(new Date(value).getTime()))throw new DomainError(422,'VALIDATION',`${key} must be an ISO date.`);return new Date(value).toISOString();}
export function evidence(body:Body,key:string) {return list(body,key,5).map(v=>{if(typeof v!=='string'||!/^proof\/[a-zA-Z0-9/_\-.]+$/.test(v))throw new DomainError(422,'VALIDATION','Evidence must reference a verified private upload.');return v;});}
