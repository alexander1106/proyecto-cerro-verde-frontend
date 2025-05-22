import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replaceSpaces' })
export class ReplaceSpacesPipe implements PipeTransform {
  transform(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
  }
}
