import React from "react";
import Svg, {
  Path,
  G,
  ClipPath,
  Defs,
  Rect,
  LinearGradient,
  Stop,
} from "react-native-svg";

export function BackArrowIcon({
  width = 24,
  height = 24,
  color = "white",
  opacity = 0.7,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.9948 18.9918L4.9978 11.9948L11.9948 4.99783"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="1.99913"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.9917 11.9948H4.9978"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="1.99913"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({
  width = 16,
  height = 16,
  color = "#FDC700",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="clip0_28_2722">
          <Rect width="15.9931" height="15.9931" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_28_2722)">
        <Path
          d="M14.1098 4.53938C14.4622 4.18715 14.6601 3.70939 14.6602 3.21119C14.6602 2.713 14.4624 2.23519 14.1102 1.88287C13.7579 1.53055 13.2802 1.33258 12.782 1.33252C12.2838 1.33246 11.806 1.5303 11.4537 1.88253L2.56019 10.778C2.40547 10.9323 2.29105 11.1222 2.227 11.3311L1.34671 14.2312C1.32949 14.2888 1.32819 14.35 1.34295 14.4083C1.35771 14.4666 1.38798 14.5199 1.43054 14.5624C1.47311 14.6049 1.52638 14.635 1.58472 14.6497C1.64305 14.6644 1.70426 14.663 1.76187 14.6457L4.66261 13.766C4.8713 13.7026 5.06122 13.5888 5.2157 13.4349L14.1098 4.53938Z"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="1.33275"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

export function RemoveIcon({
  width = 20,
  height = 20,
  color = "white",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 6L18 18"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrophyIcon({
  width = 204,
  height = 204,
  color = "white",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 204 204" fill="none">
      <Defs>
        <LinearGradient
          id="trophyGradient"
          x1="38"
          y1="13"
          x2="165.985"
          y2="140.985"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FDC700" />
          <Stop offset="1" stopColor="#D08700" />
        </LinearGradient>
      </Defs>
      <G>
        <Path
          d="M38 76.9925C38 41.6504 66.6504 13 101.992 13C137.335 13 165.985 41.6504 165.985 76.9925C165.985 112.335 137.335 140.985 101.992 140.985C66.6504 140.985 38 112.335 38 76.9925Z"
          fill="url(#trophyGradient)"
        />
        <Path
          d="M81.9862 66.9943H76.9871C74.7774 66.9943 72.6581 66.1164 71.0956 64.5539C69.5331 62.9914 68.6553 60.8722 68.6553 58.6624C68.6553 56.4527 69.5331 54.3335 71.0956 52.7709C72.6581 51.2084 74.7774 50.3306 76.9871 50.3306H81.9862"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M121.979 66.9943H126.978C129.188 66.9943 131.307 66.1164 132.87 64.5539C134.432 62.9914 135.31 60.8722 135.31 58.6624C135.31 56.4527 134.432 54.3335 132.87 52.7709C131.307 51.2084 129.188 50.3306 126.978 50.3306H121.979"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M75.3208 110.32H128.644"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M95.317 85.8575V93.6561C95.317 95.4891 93.7507 96.9222 92.0843 97.6887C88.1517 99.4884 85.3188 104.454 85.3188 110.32"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M108.648 85.8575V93.6561C108.648 95.4891 110.214 96.9222 111.881 97.6887C115.813 99.4884 118.646 104.454 118.646 110.32"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M121.979 43.6652H81.9863V66.9943C81.9863 72.2976 84.0931 77.3838 87.8431 81.1338C91.5932 84.8839 96.6793 86.9906 101.983 86.9906C107.286 86.9906 112.372 84.8839 116.122 81.1338C119.872 77.3838 121.979 72.2976 121.979 66.9943V43.6652Z"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
