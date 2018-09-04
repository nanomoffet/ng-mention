# Angular Mentions

Simple Angular mentions inspired by [Ment.io](https://github.com/jeff-collins/ment.io).

[Click here for a Demo](http://dmacfarlane.github.io/angular-mentions/)

Provides auto-complete suggestions for @mentions in text input fields, text areas,
and content editable fields. Not fully browser tested and comes without warranty!

To install and start the demo application:

    git clone https://github.com/dmacfarlane/angular-mentions.git
    cd angular-mentions
    npm install
    ng serve

### Usage

Add the package as a dependency to your project using:

    npm install --save angular-mentions

Add the CSS to your index.html:

    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">

Add the module to your app.module imports:

    import { MentionModule } from 'angular-mentions/mention';
    ...

    @NgModule({
        imports: [ MentionModule ],
        ...
    })

Add the `[mention]` directive to your input element:

    <input type="text" [mention]="items">

Where `items` is a string array of the items to suggest. For example:

    items: string[] = ["Noah", "Liam", "Mason", "Jacob", ...

#### Configuration Options

The following optional configuration items can be used.

| Option        | Default  | Description |
| ---           | ---      | ---         |
| triggerChar   | @        | The character that will trigger the menu behavior. |
| maxItems      |          | Limit the number of items shown in the pop-up menu. The default is no limit. |
| mentionSelect |          | An optional function to format the selected item before inserting the text. |
| labelKey      | 'label'  | The field to be used as the item label (when the items are objects). |
| filterKeys    | ['label']| The field(s) to search on, if the items are objects. |
| showListHeader | false   | Show or hide a header for the search list. |
| maxHeight     | 300      | Option to set a max height for the search list, in pixels. |
| minWidth      | 250      | Option to set a minimum width for the search list, in pixels. |
| maxWidth      | 500      | Option to set a max width for the search list, in pixels. |
| positionType  | 'cursor' | Specify the position of the list. Options are cursor, above, below, or detect. |
| xPos          | 0        | Option to specify a specific x-offset, in pixels. |
| yPos          | 0        | Option to specify a specific y-offset, in pixels. |
| listItemHeight  | 26     | Option to specify a particular line-item height, in pixels. (only needed if using an advanced custom template for the list items) |
| disableSearch | false    | Disable internal filtering (only useful if async search is used). |

For Example: 

    <input type="text" [mention]="items" [mentionConfig]="{triggerChar:'#', maxItems:10, labelKey:'name', positionType: 'above', showListHeader: true}">

#### Output Events

- `(searchTerm)=""` event emitted whenever the search term changes. Can be used to trigger async search.
