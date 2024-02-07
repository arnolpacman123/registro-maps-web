export interface RegisterVisit {
  id?: number;
  address: string;
  geom: Point;
  hour?: string;
  description?: string;
}

export interface Point {
  type: "Point";
  coordinates: Position;
}

export type Position = [ number, number ];
