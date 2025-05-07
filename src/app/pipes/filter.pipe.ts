import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    standalone:true
})

export class FilterPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        if (!items || !searchText) return items;
        return items.filter(item =>
            item.razon_social.toLowerCase().includes(searchText.toLowerCase())
        );
    }
}