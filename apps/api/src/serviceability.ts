import type {ServiceabilityResult} from './types.ts';

export const isIndianPin=(pin:unknown):pin is string=>typeof pin==='string'&&/^[1-9]\d{5}$/.test(pin);
export interface ServiceabilityPolicy {evaluate(pin:string):ServiceabilityResult}
export interface DevelopmentAreaConfig {
  mode:'national'|'pilot';
  pilotPins?:readonly string[];
  allowedPins?:readonly string[];
  deniedPins?:readonly string[];
}

/** Development checkout eligibility only. Never a postal directory or carrier coverage check. */
export class DevelopmentServiceabilityPolicy implements ServiceabilityPolicy {
  private pilotPins:Set<string>;
  private allowedPins:Set<string>;
  private deniedPins:Set<string>;
  constructor(private config:DevelopmentAreaConfig){
    if(!['national','pilot'].includes(config.mode))throw new Error('SERVICEABILITY_MODE must be national or pilot.');
    this.pilotPins=this.pins(config.pilotPins??['400008']);
    this.allowedPins=this.pins(config.allowedPins??[]);
    this.deniedPins=this.pins(config.deniedPins??[]);
  }
  private pins(values:readonly string[]){
    if(values.some(pin=>!isIndianPin(pin)))throw new Error('Serviceability configuration contains an invalid PIN; use six digits starting with 1–9.');
    return new Set(values);
  }
  evaluate(pin:string):ServiceabilityResult {
    const valid=isIndianPin(pin);
    const denied=valid&&this.deniedPins.has(pin);
    const eligible=valid&&!denied&&(this.config.mode==='national'||this.pilotPins.has(pin)||this.allowedPins.has(pin));
    const reason=!valid?'invalid_pin':denied?'explicitly_denied':!eligible?'outside_pilot':'eligible_development';
    const message=reason==='invalid_pin'?'Enter a six-digit Indian PIN code starting with 1–9.':reason==='explicitly_denied'?'This PIN code is disabled by the current development service-area policy.':reason==='outside_pilot'?'This PIN code is outside the configured development service areas.':`Eligible for the ${this.config.mode==='national'?'India-wide':'configured-area'} development marketplace. PIN format only; postal existence, seller coverage, pickup, and carrier delivery are not verified.`;
    return {pin,serviceable:eligible,scope:this.config.mode,validation:'format-only',logisticsVerified:false,reason,deliveryChargePaise:4900,freeDeliveryAbovePaise:100000,pickupAvailable:eligible,message};
  }
}

export function developmentAreaPolicy(env:Record<string,string|undefined>=process.env):DevelopmentServiceabilityPolicy {
  const mode=env.SERVICEABILITY_MODE??'national';
  if(mode!=='national'&&mode!=='pilot')throw new Error('SERVICEABILITY_MODE must be national or pilot.');
  const pins=(value:string|undefined)=>value?.split(',').map(pin=>pin.trim()).filter(Boolean)??[];
  return new DevelopmentServiceabilityPolicy({mode,pilotPins:pins(env.SERVICEABILITY_PILOT_PINS??'400008'),allowedPins:pins(env.SERVICEABILITY_ALLOW_PINS),deniedPins:pins(env.SERVICEABILITY_DENY_PINS)});
}
