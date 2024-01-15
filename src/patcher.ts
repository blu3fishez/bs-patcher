import { FabricVersion, fetchVersion } from "./fetch";
import { join, homeDir, resolveResource } from '@tauri-apps/api/path';
import { imgCode } from "./assets/image.json";
import { copyFile, createDir, exists, readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { message } from "@tauri-apps/api/dialog";

const TITLE_PREFIX = "bspatcher-";

export interface Profile {
  lastUsed:string,
  lastVersionID:string,
  created:string,
  name:string,
  icon:string,
  type:"custom"
}

// function getTimezoneOffset():string {
//   function twoDigit(num:number):string {
//     return num > 10 ? String(num) : '0' + num;
//   }

//   let offset = new Date().getTimezoneOffset();
//   let sign = offset < 0 ? '+' : '-';
//   offset = Math.abs(offset);
//   return sign + twoDigit(offset/60) + twoDigit(offset%60);
// }

function createProfile (version:string, loaderVersion:string) {
  let title:string = TITLE_PREFIX + version;
  let createTime = new Date().toISOString();// new Date().toISOString().slice(0, -5) + getTimezoneOffset();
  let ret:Record<string, Profile> = {};
  ret[title] = {
    lastUsed:createTime,
    lastVersionID:`fabric-loader-${loaderVersion}-${version}`,
    name:title,
    created:createTime,
    icon:imgCode,
    type:"custom",
  };
  return ret;
}

/**
 * dir 내 folderName 폴더 내 아이템들을 모두, .minecraft/ 에 복사합니다.
 * @param dir 복사될 리소스의 부모 디렉토리
 * @param folderName 부모 디렉토리 내 복사할 디렉토리
 */
async function copyAssets(dir:string, folderName:string) {
  const minecraftPath = await join(await homeDir() + "AppData/Roaming/.minecraft/");
  const resourcePath = await resolveResource(await join(dir, folderName));
  const mcDir = await join(minecraftPath, folderName);
  if(await exists(mcDir) == false) {
    await createDir(mcDir);
  }
  for await (let t of await readDir(resourcePath)) {
    if(!t || !t.name) continue;
    const src = await join(resourcePath, t.name);
    const dst = await join(mcDir, t.name);
    await copyFile(src, dst);
  }
}

export async function patch(version:string, loaderVersion:string):Promise<number> {
  console.log("Patch Started!");
  // 가져온 loader data 를 집어넣기 \
  const fabricVersion:FabricVersion = await fetchVersion("1.20.4", "0.15.3");
  const profile = createProfile(version, loaderVersion);
  const minecraftPath = await join(await homeDir() + "AppData/Roaming/.minecraft/");
  
  /**이제남은일 
   * 
   * version/fabric-loader-${loaderVersion}-${version} 디렉토리에, fabricVersion 넣기
   */
  let versionDir = await join(minecraftPath, "versions");

  if(await exists(versionDir) == false) {
    console.error("Version Folder not exists. check if you had installed minecraft launcher first.");
    return 1;
  }

  versionDir = await join(versionDir, `fabric-loader-${loaderVersion}-${version}`);

  if(await exists(versionDir) == false) {
    await createDir(versionDir);
  }

  await writeTextFile(await join(versionDir, `fabric-loader-${loaderVersion}-${version}.json`), JSON.stringify(fabricVersion));
  /**
   * fabricVersion 에 따라 의존성 설치하기
   *    libraries/점과 콜론으로 split해서 폴더 생성/`마지막 원소-마지막 원소` 형식으로 된 파일 fetch 해서 넣기
   * 이거 할 필요 없어서 스킵.
  */

  /**
   * profile 추가하기.
   */
  const launcherProfilePath = await join(minecraftPath, "launcher_profiles.json");
  if(await exists(launcherProfilePath) == false) {
    console.error("Profile not exists. check if you had installed minecraft launcher first.");
    return 2;
  }
  const launcherProfile = JSON.parse(await readTextFile(launcherProfilePath));
  
  Object.assign(launcherProfile.profiles, profile);
  await writeTextFile(launcherProfilePath, JSON.stringify(launcherProfile));
  console.log("created profile");

  /**
   * mods 와 shaders 폴더를 각각 복사 후 붙여넣기
   * 
  */
  copyAssets(`resources/${version}`, "mods");
  copyAssets(`resources/${version}`, "shaderpacks");

  // checks
  console.log(createProfile(version, loaderVersion));
  console.log(fabricVersion);
  console.log(minecraftPath);
  console.log("Patch End!");
  await message('버그 있을 시 블피(blu3fishez)에게 제보 부탁드립니다.', {"title":'패치 완료',"okLabel":"ㅇㅇ","type":"info"});
  return 0;
}