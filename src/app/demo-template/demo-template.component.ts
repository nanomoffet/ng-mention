import { Component } from '@angular/core';

import { COMMON_NAMES } from '../common-names';

@Component({
  selector: 'app-demo-template',
  templateUrl: './demo-template.component.html'
})
export class DemoTemplateComponent {

  complexItemsWithDifferentUsernames: any[] = [
    {
      label: 'Aaron Balakay',
      username: 'ayayron_balakay'
    },
    {
      label: 'Susie Smith',
      username: 'sassy_and_suzie'
    },
    {
      label: 'Jacob Monty',
      username: 'jmonty'
    },
    {
      label: 'Lucille Austero',
      username: 'luci_2'
    }
  ];

  complexItems: any[] = COMMON_NAMES.map(name => {
    return {label: name, username: name.toLowerCase()};
  });

  format = (item: any) => {
    return `[${item.username}]`;
  }
}
