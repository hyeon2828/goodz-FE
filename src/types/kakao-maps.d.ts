// 새 의존성 추가 대신 실제 쓰는 API 표면만 최소로 선언함.
export {};

declare global {
  interface KakaoLatLng {
    getLat(): number;
    getLng(): number;
  }

  interface KakaoLatLngBounds {
    extend(latlng: KakaoLatLng): void;
  }

  interface KakaoMapInstance {
    setBounds(bounds: KakaoLatLngBounds): void;
    setCenter(latlng: KakaoLatLng): void;
    setLevel(level: number): void;
  }

  interface KakaoCustomOverlay {
    setMap(map: KakaoMapInstance | null): void;
  }

  interface KakaoMapsNamespace {
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    LatLngBounds: new () => KakaoLatLngBounds;
    Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
    CustomOverlay: new (options: {
      position: KakaoLatLng;
      content: HTMLElement;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
    }) => KakaoCustomOverlay;
    load(callback: () => void): void;
  }

  interface Window {
    kakao: {
      maps: KakaoMapsNamespace;
    };
  }
}
