import * as _ from "lodash";

export enum AnnotationClass {
  INVALID = "invalid-term-occurrence",
  ASSIGNED_OCCURRENCE = "assigned-term-occurrence",
  SUGGESTED_OCCURRENCE = "suggested-term-occurrence",
  LOADING = "loading-term-occurrence",
  PENDING_DEFINITION = "pending-term-definition",
  DEFINITION = "term-definition",
}

export enum AnnotationOrigin {
  PROPOSED = "proposed-occurrence",
  SELECTED = "selected-occurrence",
}

const CLASSES = Object.values(AnnotationClass);
const ORIGINS = Object.values(AnnotationOrigin);

export type AnnotationOriginFilter = {
  [key in AnnotationOrigin]: boolean;
};

type AnnotationLegendFilter = {
  [key in AnnotationClass]: AnnotationOriginFilter;
};

/**
 * Defines whether annotation of specific class or origin should be shown or hidden
 * in the Annotator
 */
export default class AnnotatorLegendFilter {
  private readonly filter: AnnotationLegendFilter;

  constructor() {
    this.filter = {} as AnnotationLegendFilter;

    CLASSES.forEach((classValue) => {
      this.filter[classValue] = {} as AnnotationOriginFilter;
      ORIGINS.forEach((originValue) => {
        this.filter[classValue][originValue] = true;
      });
    });
  }

  public get(
    annotationClass: AnnotationClass,
    annotationOrigin: AnnotationOrigin = AnnotationOrigin.SELECTED
  ): boolean {
    return this.filter[annotationClass][annotationOrigin];
  }

  public set(
    annotationClass: AnnotationClass,
    annotationOrigin: AnnotationOrigin = AnnotationOrigin.SELECTED,
    value: boolean
  ): void {
    this.filter[annotationClass][annotationOrigin] = value;
  }

  /**
   * @returns true if any annotation is hidden (any filter value is false)
   */
  public isAnyHidden(): boolean {
    const values = CLASSES.flatMap((classValue) =>
      ORIGINS.map((originValue) => this.filter[classValue][originValue])
    );
    return values.includes(false);
  }

  /**
   * Creates deep clone of this filter
   */
  public clone() {
    return _.cloneDeep(this);
  }
}
