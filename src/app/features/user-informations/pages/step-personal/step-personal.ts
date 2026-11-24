import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurriculumFormStore } from '../../../../core/services/curriculum-form-store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { StateAndCitiesApi } from '../../../../core/services/states-and-cities-api';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { InputValidationDirective } from '../../../../shared/directives/input-validation-directive';

@Component({
  selector: 'app-step-personal',
  imports: [ReactiveFormsModule, InputValidationDirective,InputValidationDirective],
  templateUrl: './step-personal.html',
})
export class StepPersonal {
  readonly _curriculumFormStore = inject(CurriculumFormStore);
  private readonly _router = inject(Router);
  private readonly _stateAndCitiesApi = inject(StateAndCitiesApi);

  get stateControl() {
    return this._curriculumFormStore.personalFormGroup.get('state') as FormControl;
  }

  get citieControl() {
    return this._curriculumFormStore.personalFormGroup.get('city') as FormControl;
  }

  citiesResource = rxResource({
    params: () => {
      const state = this.selectedState();

      if(!state) return undefined;

      return state;
    },
    stream: ({params}) => this._stateAndCitiesApi.getCities(params),
  });

  selectedState = toSignal<string>(this.stateControl!.valueChanges.pipe(
    tap(()=>{
      this.citieControl.setValue('', { emitEvent: false }) //quando valor mudar quem tiver inscrito não será notificado
    })
  ), {
    initialValue: this.stateControl!.value || '',
  });

  citiesList = computed(() => {
    const ERROR_ON_RESPONSE = !!this.citiesResource.error();

    if(ERROR_ON_RESPONSE) return [];

    return this.citiesResource.value();
  })

  statesResource = rxResource({
    params: () => true,
    stream: () => this._stateAndCitiesApi.getStates(),
  });

  

  stateList = computed(() => {
    const ERROR_ON_RESPONSE = !!this.statesResource.error();

    if (ERROR_ON_RESPONSE) return [];

    return this.statesResource.value();
  });

  goToProfessional() {
    console.log('Personal Value', this._curriculumFormStore.personalFormGroup);
    this._router.navigate(['/professional']);
  }

  
}
