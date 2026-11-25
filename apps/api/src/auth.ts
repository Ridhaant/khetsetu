import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { DomainError, type Actor } from './types.ts';
export class Sessions {
  private secret:string;
  constructor(secret?:string) { this.secret=secret||randomBytes(48).toString('hex'); }
  issue(actor:Actor) {
    const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
    const body=Buffer.from(JSON.stringify({...actor,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+900,iss:'khetsetu-demo',aud:'khetsetu'})).toString('base64url');
    const signature=createHmac('sha256',this.secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }
  verify(bearer:string|undefined):Actor {
    if(!bearer?.startsWith('Bearer '))throw new DomainError(401,'AUTH_REQUIRED','Sign in to continue.');
    const token=bearer.slice(7);const parts=token.split('.');if(parts.length!==3)throw new DomainError(401,'INVALID_SESSION','Your session is invalid.');
    const [header,body,signature]=parts as [string,string,string];
    const expected=createHmac('sha256',this.secret).update(`${header}.${body}`).digest();const actual=Buffer.from(signature,'base64url');
    if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new DomainError(401,'INVALID_SESSION','Your session is invalid.');
    let claims:Actor&{exp:number;iss:string;aud:string};try{claims=JSON.parse(Buffer.from(body,'base64url').toString());}catch{throw new DomainError(401,'INVALID_SESSION','Your session is invalid.');}
    if(claims.exp<=Date.now()/1000||claims.iss!=='khetsetu-demo'||claims.aud!=='khetsetu')throw new DomainError(401,'SESSION_EXPIRED','Sign in again to continue.');
    return {id:claims.id,role:claims.role,...(claims.sellerId?{sellerId:claims.sellerId}:{})};
  }
}
