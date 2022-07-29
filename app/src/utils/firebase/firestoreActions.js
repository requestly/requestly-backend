import { firestoreDb } from "../../clients/firebase"

export const sendEventToFirestore  = async (sdkId, deviceId, eventObj) => {
  return await firestoreDb
      .collection("sdks")
      .doc(sdkId)
      .collection("devices")
      .doc(deviceId)
      .collection("events")
      .add({
        sdkId,
        deviceId,
        event: eventObj
      })
}