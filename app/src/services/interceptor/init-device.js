import { FieldValue } from "firebase-admin/firestore";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

import { firestoreDb } from "../../clients/firebase.js";

const initSdkDevice = async (sdkId, deviceId, captureEnabled = true, deviceDetails = {}) => {
    if(!deviceId) {
        deviceId = generateNewDeviceId();
    }

    await addDeviceDetail(
        sdkId,
        deviceId,
        captureEnabled,
        deviceDetails,
    );

    return deviceId;
}

const addDeviceDetail = async (
    sdkId,
    deviceId,
    captureEnabled = true,
    deviceDetails = {},
  ) => {
    try {
      const deviceDetail = {
        id: deviceId,
        model: deviceDetails["model"] || null,
        name: deviceDetails["name"] || null,
      };
  
      await firestoreDb
        .collection("sdks")
        .doc(sdkId)
        .update({
          devices: FieldValue.arrayUnion(deviceDetail),
          enabled_device_ids: captureEnabled
            ? FieldValue.arrayUnion(deviceId)
            : FieldValue.arrayRemove(deviceId),
        });
      await firestoreDb
        .collection("sdks")
        .doc(sdkId)
        .collection("devices")
        .doc(deviceId)
        .set({}, { merge: true });
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
