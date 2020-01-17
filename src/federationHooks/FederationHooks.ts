/**
 * Copyright 2018-2020 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */




import { PkHooks, MsFederation, PkCore, MsMail } from "@symlinkde/eco-os-pk-models";
import { AxiosResponse } from "axios";
import { injectable } from "inversify";
import { injectQueueClient } from "@symlinkde/eco-os-pk-core";
import { Log, LogLevel } from "@symlinkde/eco-os-pk-log";

@injectQueueClient
@injectable()
export class FederationHooks implements PkHooks.IFederationHooks {
  private queueClient!: PkCore.IEcoQueueClient;

  public async postRemoteContent(
    content: MsFederation.IFederationPostObject,
    config: MsMail.IMailFederationFailed,
  ): Promise<AxiosResponse> {
    try {
      return await this.queueClient.addJob({
        job: {
          target: "eco-os-federation-service",
          path: "/federation/content",
          method: "POST",
          payload: {
            body: content,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "eco-os-mail-service",
          path: "/mail/federation/fail",
          method: "POST",
          payload: {
            body: {
              to: config.to,
              targetDomain: config.targetDomain,
              timeStamp: config.timeStamp,
            },
            headers: "",
            params: "",
          },
        },
      });
    } catch (err) {
      Log.log(err.message, LogLevel.error);
      throw new Error(err);
    }
  }

  public async postRemoteContentAsCommunity(
    content: MsFederation.IFederationPostObject,
    config: MsMail.IMailFederationFailed,
  ): Promise<AxiosResponse> {
    try {
      return await this.queueClient.addJob({
        job: {
          target: "eco-os-federation-service",
          path: "/federation/content/community",
          method: "POST",
          payload: {
            body: content,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "eco-os-mail-service",
          path: "/mail/federation/fail",
          method: "POST",
          payload: {
            body: {
              to: config.to,
              targetDomain: config.targetDomain,
              timeStamp: config.timeStamp,
            },
            headers: "",
            params: "",
          },
        },
      });
    } catch (err) {
      Log.log(err.message, LogLevel.error);
      throw new Error(err);
    }
  }

  public async queueIncommingFederationContent(fedObject: MsFederation.IFederationPostObject): Promise<AxiosResponse> {
    try {
      return await this.queueClient.addJob({
        job: {
          target: "eco-os-federation-service",
          path: "/federation/remote/content",
          method: "POST",
          payload: {
            body: fedObject,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "eco-os-federation-service",
          path: "/federation/remote/content",
          method: "POST",
          payload: {
            body: fedObject,
            headers: "",
            params: "",
          },
        },
      });
    } catch (err) {
      Log.log(err.message, LogLevel.error);
      throw new Error(err);
    }
  }
}
