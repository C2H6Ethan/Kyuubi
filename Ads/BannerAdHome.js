import React from "react";
import { Platform, View } from "react-native";
import { AdMobBanner } from "expo-ads-admob";
const BannerAd = () => {
  const unitID = Platform.select({
     ios: "ca-app-pub-9310152642296392/6854555566",
  });
 
  return (
    <View style={{justifyContent: "center", alignItems: "center" }}>
      <AdMobBanner
        adUnitID={unitID}
        bannerSize="smartBanner"
        servePersonalizedAds={true}
        style={{
        }}
      />
    </View>
  );
};

export default BannerAd;
