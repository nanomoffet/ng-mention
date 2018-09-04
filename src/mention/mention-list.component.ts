import {
  Component, ElementRef, Output, EventEmitter, ViewChild, ContentChild, Input,
  TemplateRef, OnInit
} from '@angular/core';

import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';

/**
 * Angular 2 Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
@Component({
  selector: 'mention-list',
  styles: [`
      .scrollable-menu {
        display: block;
        height: auto;
        overflow: auto;
      }
    `, `
      [hidden] {
        display: none;
      }
    `, `
      li.active {
        background-color: #f7f7f9;
      }
    `],
  template: `
    <ng-template #defaultItemTemplate let-item="item">
      {{item[labelKey]}}
    </ng-template>
    <ul #list [hidden]="hidden" class="dropdown-menu scrollable-menu"
              [ngStyle]="{'max-height': maxHeight + 'px', 'min-width': minWidth + 'px', 'max-width': maxWidth + 'px', 'padding': 0}">
        <li *ngIf="showListHeader" class="list-group-item disabled">People Matching "{{triggerChar}}{{searchString}}"</li>
        <li *ngFor="let item of items; let i = index" [class.active]="activeIndex==i" [ngStyle]="{'height': listItemHeight + 'px'}">
            <a class="dropdown-item" (mousedown)="activeIndex=i;itemClick.emit();$event.preventDefault()">
              <ng-template [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{'item':item}"></ng-template>
            </a>
        </li>
    </ul>
    `
})
export class MentionListComponent implements OnInit {
  @Input() labelKey: string = 'label';
  @Input() itemTemplate: TemplateRef<any>;
  @Output() itemClick = new EventEmitter();
  @ViewChild('list') list: ElementRef;
  @ViewChild('defaultItemTemplate') defaultItemTemplate: TemplateRef<any>;
  items = [];
  activeIndex = 0;
  hidden = false;
  public triggerChar: string | number;
  public maxHeight: number;
  public minWidth: number;
  public maxWidth: number;
  public showListHeader: boolean;
  public listItemHeight: number;
  public searchString: string;
  constructor(private _element: ElementRef) { }

  ngOnInit() {
    if (!this.itemTemplate) {
      this.itemTemplate = this.defaultItemTemplate;
    }
  }

  // lots of confusion here between relative coordinates and containers
  public position(nativeParentElement: HTMLInputElement, iframe: HTMLIFrameElement = null, position?: string,
    xPos?: number, yPos?: number) {
    let coords = { top: 0, left: 0 };
    const el: HTMLElement = this._element.nativeElement;
    if (isInputOrTextAreaElement(nativeParentElement)) {
      this.updatePosition(nativeParentElement, position, this.items.length);
    } else if (iframe) {
      const context: { iframe: HTMLIFrameElement, parent: Element } = { iframe: iframe, parent: iframe.offsetParent };
      coords = getContentEditableCaretCoords(context);
    } else {
      const doc = document.documentElement;
      const scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      const scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

      // bounding rectangles are relative to view, offsets are relative to container?
      const caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
      const parentRelativeToContainer: ClientRect = nativeParentElement.getBoundingClientRect();

      coords.top = caretRelativeToView.top - parentRelativeToContainer.top + nativeParentElement.offsetTop - scrollTop;
      coords.left = caretRelativeToView.left - parentRelativeToContainer.left + nativeParentElement.offsetLeft - scrollLeft;
      el.style.position = 'absolute';
      el.style.left = coords.left + (xPos || 0) + 'px';
      el.style.top = coords.top + (yPos || 0) + 'px';
    }
  }

  public updatePosition(nativeParentElement?: HTMLInputElement, position?: string, itemsLength?: number,
    xPos?: number, yPos?: number): void {
    const el: HTMLElement = this._element.nativeElement;
    el.style.position = 'absolute';
    if (nativeParentElement && itemsLength) {
      switch (position) {
        case 'above':
          // Default bootstrap <li> height value is 26.
          const offsetHeight = (this.listItemHeight ? this.listItemHeight : 26) * itemsLength;
          // If the offset height is greater than the max-height, then simply use the max-height.
          el.style.top = (nativeParentElement.offsetTop -
            (offsetHeight < this.maxHeight && offsetHeight > 0 ? (offsetHeight + 42) : this.maxHeight)) - 6 + (yPos || 0) + 'px';
          el.style.left = nativeParentElement.offsetLeft + (xPos || 0) + 'px';
          break;
        case 'below':
          // Offset the list from the parent offset height + the 
          el.style.top = nativeParentElement.offsetTop + nativeParentElement.offsetHeight - 1 + (yPos || 0) + 'px';
          el.style.left = nativeParentElement.offsetLeft + (xPos || 0) + 'px';
          break;
        case 'detect':
          // Get the relative distance of the input element to the bottom of the window.
          if (window.innerHeight - nativeParentElement.getBoundingClientRect().top < this.maxHeight) {
            this.updatePosition(nativeParentElement, 'above', itemsLength, xPos, yPos);
          } else {
            this.updatePosition(nativeParentElement, 'below', itemsLength, xPos, yPos);
          }
          break;
        default:
          const coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart);
          coords.top = nativeParentElement.offsetTop + coords.top + 16 + (yPos || 0);
          coords.left = nativeParentElement.offsetLeft + coords.left + (xPos || 0);
          el.style.top = coords.top + 'px';
          el.style.left = coords.left + 'px';
      }
    }
  }

  get activeItem() {
    return this.items[this.activeIndex];
  }

  activateNextItem() {
    // adjust scrollable-menu offset if the next item is out of view
    let listEl: HTMLElement = this.list.nativeElement;
    let activeEl = listEl.getElementsByClassName('active').item(0);
    if (activeEl) {
      let nextLiEl: HTMLElement = <HTMLElement>activeEl.nextSibling;
      if (nextLiEl && nextLiEl.nodeName == "LI") {
        let nextLiRect: ClientRect = nextLiEl.getBoundingClientRect();
        if (nextLiRect.bottom > listEl.getBoundingClientRect().bottom) {
          listEl.scrollTop = nextLiEl.offsetTop + nextLiRect.height - listEl.clientHeight;
        }
      }
    }
    // select the next item
    this.activeIndex = Math.max(Math.min(this.activeIndex + 1, this.items.length - 1), 0);
  }

  activatePreviousItem() {
    // adjust the scrollable-menu offset if the previous item is out of view
    let listEl: HTMLElement = this.list.nativeElement;
    let activeEl = listEl.getElementsByClassName('active').item(0);
    if (activeEl) {
      let prevLiEl: HTMLElement = <HTMLElement>activeEl.previousSibling;
      if (prevLiEl && prevLiEl.nodeName == "LI") {
        let prevLiRect: ClientRect = prevLiEl.getBoundingClientRect();
        if (prevLiRect.top < listEl.getBoundingClientRect().top) {
          listEl.scrollTop = prevLiEl.offsetTop;
        }
      }
    }
    // select the previous item
    this.activeIndex = Math.max(Math.min(this.activeIndex - 1, this.items.length - 1), 0);
  }

  resetScroll() {
    this.list.nativeElement.scrollTop = 0;
  }
}
