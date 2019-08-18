/**
 * Copyright 2018-2019 Symlink GmbH
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



import { MsMail, MsUser, PkCore, PkHooks } from "@symlinkde/eco-os-pk-models";
import { injectConfigClient, injectQueueClient } from "@symlinkde/eco-os-pk-core";
import { Log, LogLevel } from "@symlinkde/eco-os-pk-log";
import { injectable } from "inversify";
import { AxiosResponse } from "axios";

@injectQueueClient
@injectConfigClient
@injectable()
export class UserHooks implements PkHooks.IUserHooks {
  private configClient!: PkCore.IEcoConfigClient;
  private queueClient!: PkCore.IEcoQueueClient;

  public async afterCreate(user: MsUser.IUser): Promise<AxiosResponse> {
    try {
      const instanceURI: string = await this.resolveInstanceURI();
      const payLoad: MsMail.IMailActivateAccount = {
        to: user.email,
        activationId: user.activationId,
        appURL: `secondLock://activation=${user.activationId}`,
        webURL: `${instanceURI}/#/activation/${user.activationId}`,
      };

      return await this.queueClient.addJob({
        job: {
          target: "eco-os-mail-service",
          path: "/mail/account/activate",
          method: "POST",
          payload: {
            body: payLoad,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "eco-os-user-service",
          path: `/account/${user._id}`,
          method: "DELETE",
          payload: {
            body: "",
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

  public async afterForgotPassword(user: MsUser.IUser, otp: string): Promise<AxiosResponse> {
    try {
      const instanceURI: string = await this.resolveInstanceURI();
      const payLoad: MsMail.IMailResetPassword = {
        to: user.email,
        forgotPasswordId: user.forgotPasswordId === undefined ? "" : user.forgotPasswordId,
        appURL: `secondLock://change=${user.forgotPasswordId}`,
        webURL: `${instanceURI}/#/change/${user.forgotPasswordId}`,
        otp,
      };

      return await this.queueClient.addJob({
        job: {
          target: "eco-os-mail-service",
          path: "/mail/account/password",
          method: "POST",
          payload: {
            body: payLoad,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "",
          path: "",
          method: "",
          payload: {
            body: "",
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

  public async afterChangePassword(user: MsUser.IUser, otp: string): Promise<AxiosResponse> {
    try {
      const instanceURI: string = await this.resolveInstanceURI();
      const payLoad: MsMail.IMailResetPassword = {
        to: user.email,
        forgotPasswordId: user.forgotPasswordId === undefined ? "" : user.forgotPasswordId,
        appURL: `secondLock://change=${user.forgotPasswordId}`,
        webURL: `${instanceURI}/#/change/${user.forgotPasswordId}`,
        otp,
      };

      return await this.queueClient.addJob({
        job: {
          target: "eco-os-mail-service",
          path: "/mail/account/change",
          method: "POST",
          payload: {
            body: payLoad,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "",
          path: "",
          method: "",
          payload: {
            body: "",
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

  public async afterActivate(user: MsUser.IUser): Promise<void> {
    return;
  }
  public async afterLookAccount(user: MsUser.IUser): Promise<AxiosResponse> {
    try {
      const instanceURI: string = await this.resolveInstanceURI();
      const payLoad: MsMail.IMailAccountLocked = {
        to: user.email,
        unlockDate: String(user.accountLockTime),
        appURL: `secondLock://forgot=${user.forgotPasswordId}`,
        webURL: `${instanceURI}/#/activation/${user.activationId}`,
      };

      return await this.queueClient.addJob({
        job: {
          target: "eco-os-mail-service",
          path: "/mail/account/locked",
          method: "POST",
          payload: {
            body: payLoad,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "",
          path: "",
          method: "",
          payload: {
            body: "",
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
  public async afterDeleteAccount(email: string): Promise<AxiosResponse> {
    try {
      return await this.queueClient.addJob({
        job: {
          target: "eco-os-key-service",
          path: `/key/${email}`,
          method: "DELETE",
          payload: {
            body: "",
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "",
          path: "",
          method: "",
          payload: {
            body: "",
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

  public async beforeDeleteHook(email: string, deleteId: string): Promise<AxiosResponse> {
    const instanceURI: string = await this.resolveInstanceURI();
    const payLoad = {
      to: email,
      deleteId,
      appURL: `secondLock://delete=${deleteId}`,
      webURL: `${instanceURI}/#/delete/${deleteId}`,
    };

    try {
      return await this.queueClient.addJob({
        job: {
          target: "eco-os-mail-service",
          path: "/mail/account/delete",
          method: "POST",
          payload: {
            body: payLoad,
            headers: "",
            params: "",
          },
        },
        failover: {
          target: "",
          path: "",
          method: "",
          payload: {
            body: "",
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

  private async resolveInstanceURI(): Promise<string> {
    const result: any = await this.configClient.get("SECONDLOCK_URL");
    return result.data.SECONDLOCK_URL;
  }
}
