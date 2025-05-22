import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replaceSpaces' })
export class ReplaceSpacesPipe implements PipeTransform {
  transform(value: string): string {
    return value
      ? value.trim().toLowerCase().replace(/\s+/g, '-')
      : '';
  }
}
