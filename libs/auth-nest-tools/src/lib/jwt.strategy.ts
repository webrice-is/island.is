import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { passportJwtSecret } from 'jwks-rsa'
import { AuthConfig } from './auth.module'
import { JwtPayload } from './jwt.payload'
import { Auth } from './auth'

const AUTH_BODY_FIELD_NAME = '__accessToken'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: AuthConfig) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: config.jwksUri,
      }),

      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromBodyField(AUTH_BODY_FIELD_NAME),
      ]),
      audience: config.audience,
      issuer: config.issuer,
      algorithms: ['RS256'],
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: JwtPayload): Promise<Auth> {
    return {
      nationalId: payload.nationalId,
      scope: payload.scope,
      client: payload.client_id,
      authorization: request.headers.authorization ?? '',
      actor: payload.act && {
        nationalId: payload.act.nationalId,
      },
      ip: String(request.headers['x-real-ip']) ?? request.ip,
      userAgent: request.headers['user-agent'],
    }
  }
}
