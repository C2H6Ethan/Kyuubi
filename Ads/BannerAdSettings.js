import React from "react";
import { Platform, View } from "react-native";
import { AdMobBanner } from "expo-ads-admob";
const BannerAd = () => {
  const unitID = Platform.select({
     ios: "ca-app-pub-3940256099942544/2934735716",
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
