import { FieldValue } from "firebase-admin/firestore";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

import { firestoreDb } from "../../clients/firebase.js";

const initSdkDevice = async (sdkId, deviceId, captureEnabled = true, deviceDetails = {}, sdkVersion = "") => {
    if(!deviceId) {
        deviceId = generateNewDeviceId();
    }

    const isAnonymousSession = await addDeviceDetail(
        sdkId,
        deviceId,
        captureEnabled,
        deviceDetails,
        sdkVersion,
    );

    return {
      deviceId,
      isAnonymousSession,
    };
}

const addDeviceDetail = async (
    sdkId,
    deviceId,
    captureEnabled = true,
    deviceDetails = {},
    sdkVersion = "",
  ) => {
    let isAnonymousSession = true;
    try {
      const deviceDetail = {
        id: deviceId,
        model: deviceDetails["model"] || null,
        name: deviceDetails["name"] || null,
      };

      // anonymous-xyz123
      if(sdkId.indexOf("anonymous-") == 0) {
        await firestoreDb
        .collection("sdks")
        .doc(sdkId)
        .set(
          {
          devices: FieldValue.arrayUnion(deviceDetail),
          enabled_device_ids: captureEnabled
            ? FieldValue.arrayUnion(deviceId)
            : FieldValue.arrayRemove(deviceId),
          },
          { merge: true },
        );
        isAnonymousSession = true;
      } else {
        await firestoreDb
        .collection("sdks")
        .doc(sdkId)
        .update({
          devices: FieldValue.arrayUnion(deviceDetail),
          enabled_device_ids: captureEnabled
            ? FieldValue.arrayUnion(deviceId)
            : FieldValue.arrayRemove(deviceId),
        });
        isAnonymousSession = false;
      }
      
      await firestoreDb
        .collection("sdks")
        .doc(sdkId)
        .collection("devices")
        .doc(deviceId)
        .set({
          lastActivityTimestamp: Date.now(),
          sdkVersion: sdkVersion,
        }, { merge: true });

      return isAnonymousSession;
    } catch (err) {
      console.log(err);
      throw Error("Error while initializing device");
    }
};


const generateNewDeviceId = () => {
    const customConfig = {
      dictionaries: [adjectives, colors, animals],
      separator: "-",
      length: 3,
    };
    const newDeviceId = uniqueNamesGenerator(customConfig);
    console.log("New Device Id", newDeviceId);
    return newDeviceId;
};

export default initSdkDevice;
