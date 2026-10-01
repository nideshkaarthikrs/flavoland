export const SERVICE_OPTIONS = ["Click & Collect","Parking","Pharmacy","Fuel","ATM","Bakery","Café","Disabled parking","EV charging"] as const;
export type Service = typeof SERVICE_OPTIONS[number];
export interface OpeningHours { monday:string;tuesday:string;wednesday:string;thursday:string;friday:string;saturday:string;sunday:string }
export interface Store { id:string;name:string;address:string;city:string;postcode:string;latitude:number;longitude:number;distance:number;phone:string;openingHours:OpeningHours;services:Service[];status:"open"|"closed";image:string }
