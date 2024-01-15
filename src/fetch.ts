import { Response, fetch } from "@tauri-apps/api/http";

const FETCH_URL = "https://meta.fabricmc.net/v2/versions/loader/";

export interface FabricVersion {
  id:string,
  inheritsFrom: string,
  releaseTime: string,
  time:string,
  type:string,
  mainClass:string,
  arguments: object,
  libraries:object,
}

export async function fetchVersion(version:string, loaderVersion:string):Promise<FabricVersion> {
  const res = await fetch(FETCH_URL + `${version}/${loaderVersion}/profile/json`, {
    method:"GET",
    timeout:30
  }) as Response<FabricVersion>;
  return res.data;
}