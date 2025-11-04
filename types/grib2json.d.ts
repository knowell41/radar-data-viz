declare module 'grib2json' {
  function grib2json(buffer: Buffer, callback: (err: any, data: any) => void): void;
  export = grib2json;
}