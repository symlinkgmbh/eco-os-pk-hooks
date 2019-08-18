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



import { PkHooks } from "@symlinkde/eco-os-pk-models";
import { hookService } from "../hookService";
import { HOOKSERVICETYPES } from "../hookServiceTypes";

// tslint:disable-next-line:typedef
function injectUserHooks<T extends new (...args: any[]) => {}>(constructor: T) {
  return class extends constructor {
    // tslint:disable-next-line: member-access
    userHooks: PkHooks.IUserHooks = hookService.get<PkHooks.IUserHooks>(HOOKSERVICETYPES.IUserHooks);
  };
}

export { injectUserHooks };