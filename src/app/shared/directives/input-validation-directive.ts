import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  Renderer2,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { pipe } from 'rxjs';

@Directive({
  selector: '[appInputValidation]',
})
export class InputValidationDirective {
  // ponte entre formulario e diretiva que quer pegar a instância formControl
  private readonly _ngControl = inject(NgControl, { self: true });
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _elementRef = inject(ElementRef); // utilizando o elementref para referencia de elemento de classe html
  private readonly _renderer2 = inject(Renderer2); // logica para adcionar ou remover classes

  private errorElement: HTMLElement | null = null;
  //ouvir eventos,inputs
  @Input() errorMessage = 'Campo inválido';

  ngOnInit() {
    this._ngControl.statusChanges
      ?.pipe(
        takeUntilDestroyed(this._destroyRef), // evitar problemas de destroy leak
      )
      .subscribe(() => {
        
      });
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes['errorMessage'] && this.errorElement) {
      this._renderer2.setProperty(this.errorElement, 'textContent', this.errorMessage);
    }
  }

  //recebe como parametro evento que quero ouvir com uma diretiva
  @HostListener('blur')
  onBluir() {
    
    this.updateStatus();
  }

  updateStatus() {
    const control = this._ngControl.control;

    if (!control) return;

    const isInvalid = control.invalid && control.touched;

    if (isInvalid) {
      console.log('invalido')
      this.setInvalidStyles();
      this.showError();
    } else {
      
      this.setValidStyles();
      this.hideError();
    }
  }

  setValidStyles() {
    const el = this._elementRef.nativeElement;

    this._renderer2.removeClass(el, 'border-red-500');
    this._renderer2.removeClass(el, 'focus:border-red-500');
    this._renderer2.removeClass(el, 'focus:ring-red-500');

    this._renderer2.addClass(el, 'border-zinc-800');
    this._renderer2.addClass(el, 'focus:border-violet-500');
    this._renderer2.addClass(el, 'focus:ring-violet-500');
  }
  setInvalidStyles() {
    const el = this._elementRef.nativeElement;

    this._renderer2.removeClass(el, 'border-zinc-800');
    this._renderer2.removeClass(el, 'focus:border-violet-500');
    this._renderer2.removeClass(el, 'focus:ring-violet-500');

    this._renderer2.addClass(el, 'border-red-500');
    this._renderer2.addClass(el, 'focus:border-red-500');
    this._renderer2.addClass(el, 'focus:ring-red-500');
  }

  hideError() {
    if (!this.errorElement) return;
    const parent = this._elementRef.nativeElement.parentNode;
    this._renderer2.removeChild(parent, this.errorElement);
    this.errorElement = null;
  }
  showError() {
    if (this.errorElement) return;
    
    //criando paragrafo
    this.errorElement = this._renderer2.createElement('p');
    const text = this._renderer2.createText(this.errorMessage);
    this._renderer2.appendChild(this.errorElement, text);

    // adcionando classes ao paragrafo
    this._renderer2.addClass(this.errorElement, 'text-red-500');
    this._renderer2.addClass(this.errorElement, 'text-sm');
    this._renderer2.addClass(this.errorElement, 'mt-1');

    //pegando instância do elemento do input
    const parent = this._elementRef.nativeElement.parentNode;
    const nextSibling = this._elementRef.nativeElement.nextSibling;

    //adicionar o paragrafo
    if (nextSibling) {
      this._renderer2.insertBefore(parent, this.errorElement, nextSibling);
    } else {
      this._renderer2.appendChild(parent, this.errorElement);
    }
  }
}
