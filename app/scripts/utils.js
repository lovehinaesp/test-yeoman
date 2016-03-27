angular.module('utils.module', [])
    .factory('Utils', [function () {

        /**
         * Calcula si el grupo que escucha oye al que se mueve
         * @param groupMoving
         * @param groupHearing
         */
        function fnGrupoDetectado(groupMoving, groupHearing) {
            var sigiloM = groupMoving.stats.sigilo,
                percepcionH = groupHearing.stats.percepcion;

            var dadoM = fnDado(100),
                dadoH = fnDado(100);

            console.log("    A tira " + dadoM);
            console.log("    B tira " + dadoH);

            sigiloM += dadoM;
            percepcionH += dadoH;

            console.log("    sigiloA: " + sigiloM);
            console.log("    percepcionB: " + percepcionH);

            // Si percepción mayor o igual que sigilo les ven
            return sigiloM <= percepcionH;
        }

        /**
         * Ordena los personajes de ambos grupos, según sus reflejos y bonos, por orden de actuación
         * @param arrayTodos
         * @param bonoA Bono a los reflejos para el grupo A
         * @param bonoB Bono a los reflejos para el grupo B
         * @param idGrupoQueEmbosca null si ninguno embosca
         * @returns {Array.<T>} Array con los ids de todos los personajes ordenados
         */
        function fnOrdenarPersonajesPorReflejos(arrayTodos, bonoA, bonoB, idGrupoQueEmbosca) {
            var ordenados = arrayTodos.sort(function (a, b) {
                var aReflejos = a.reflejos, bReflejos = b.reflejos;

                // Aplico bono
                if (bonoA && (a.group === grupoA.id)) {
                    console.log("dopao A");
                    aReflejos += bonoA;
                }
                if (bonoB && (b.group === grupoB.id)) {
                    console.log("dopao B");
                    bReflejos += bonoB;
                }

                // Devuelvo la diferencia, si es negativo b>a
                return aReflejos - bReflejos;
            });

            // Saco un array con los ids ordenados y de paso miro si embosca alguien o no
            var idsOrdenados = [];
            ordenados.forEach(function (pj) {
                if (!idGrupoQueEmbosca || (idGrupoQueEmbosca === pj.group)) {
                    idsOrdenados.push(pj.id);
                }
            });

            console.log(ordenados);
            console.log(idsOrdenados);
            return idsOrdenados;
        }

        /**
         * Si se produce una emboscada, saca del array de pjs a los del grupo emboscado
         * @param personajes
         * @param idGrupoEmbosca
         * @returns {Array}
         */
        /* function fnEmboscada(personajes, idGrupoEmbosca) {
         var arrayFinal = [];

         // Cojo sólo los personajes de ese grupo
         if (personajes.length > 0) {
         personajes.forEach(function (pj) {
         if (pj.group === idGrupoEmbosca) {
         arrayFinal.push(pj);
         }
         });
         }

         return arrayFinal;
         }*/

        /**
         * Calcula la amenaza de cada personaje en función de diferentes cosas:
         *  nivel, cuánto destacan sus stats respecto de la media,
         * @param arrayPjs
         * @param idGrupoA
         * @param idGrupoB
         * @returns {Array} ids de pjs ordenados por amenaza
         */
        function fnCalcularAmenazaPersonajes(arrayPjs, idGrupoA, idGrupoB) {
            var resultado = {
                "grupoAtemp": [],
                "grupoBtemp": []
            };
            resultado[idGrupoA] = [];
            resultado[idGrupoB] = [];

            // Media de stats
            var mFuerza = 0, mConstitucion = 0, mAgilidad = 0, mConocimiento = 0, mVidaRestante = 0;
            arrayPjs.forEach(function (pj) {
                mFuerza += pj.fuerza;
                mConstitucion += pj.constitucion;
                mAgilidad += pj.agilidad;
                mConocimiento += pj.conocimiento;
                mVidaRestante += pj.vidaRestante;
            });

            mFuerza = Math.round(mFuerza / arrayPjs.length);
            mConstitucion = Math.round(mConstitucion / arrayPjs.length);
            mAgilidad = Math.round(mAgilidad / arrayPjs.length);
            mConocimiento = Math.round(mConocimiento / arrayPjs.length);
            mVidaRestante = Math.round(mVidaRestante / arrayPjs.length);

            // Por cada personaje calculo su nivel de amenaza
            arrayPjs.forEach(function (pj) {
                // Posición según la media de stats
                var pos = (pj.fuerza - mFuerza) + (pj.constitucion - mConstitucion) +
                    (pj.agilidad - mAgilidad) + (pj.conocimiento - mConocimiento) +
                    (Math.ceil((pj.vidaRestante - mVidaRestante) / 10));

                pj.amenaza = pj.nivel + pos;

                if (idGrupoA === pj.group) {
                    resultado.grupoAtemp.push(pj);
                } else {
                    resultado.grupoBtemp.push(pj);
                }
            });

            // Ordeno los arrays por amenaza
            resultado.grupoAtemp = resultado.grupoAtemp.sort(function (a, b) {
                return b.amenaza - a.amenaza;
            });
            resultado.grupoBtemp = resultado.grupoBtemp.sort(function (a, b) {
                return b.amenaza - a.amenaza;
            });

            // Dejo sólo los IDs
            resultado[idGrupoA] = resultado.grupoAtemp.map(function (current) {
                return {"id": current.id, "amenaza": current.amenaza};
            });
            resultado[idGrupoB] = resultado.grupoBtemp.map(function (current) {
                return {"id": current.id, "amenaza": current.amenaza};
            });

            delete resultado.grupoAtemp;
            delete resultado.grupoBtemp;

            return resultado;
        }


        /**
         * Dado un grupo de personajes ordenados por amenaza, devuelvo el ID del primero
         * @param grupo
         * @returns {*}
         */
        function fnSeleccionaObjetivo(grupo) {
            if (grupo.length > 0) {
                return grupo[0].id;
            } else {
                return null;
            }
        }

        /**
         * Genera un objeto con todos los personajes con campo key el id del personaje
         * @param grupoA
         * @param grupoB
         */
        function fnListarPersonajes(grupoA, grupoB) {
            var lista = {};

            grupoA.forEach(function (p) {
                lista[p.id] = p;
            });
            grupoB.forEach(function (p) {
                lista[p.id] = p;
            });

            return lista;
        }

        /**
         * Cuenta los personajes que quedan en el grupo
         * @param grupo
         */
        function fnContarPersonajes(grupo) {
            var cuenta = 0;
            grupo.forEach(function (pj) {
                if (pj) {
                    cuenta++;
                }
            });

            return cuenta;
        }

        /**
         * Simula que lanza Y dados de X caras
         * @param caras X
         * @param amount Y
         */
        function fnDado(caras, amount) {
            // Por defecto 1
            if (!amount) {
                amount = 1;
            }

            return Math.floor(Math.random() * (caras - 1)) + 1;
        }

        return {
            grupoDetectado: fnGrupoDetectado,
            dado: fnDado,
            ordenarPersonajesPorReflejos: fnOrdenarPersonajesPorReflejos,
            listarPersonajes: fnListarPersonajes,
            // emboscada: fnEmboscada,
            calcularAmenazaPersonajes: fnCalcularAmenazaPersonajes,
            seleccionaObjetivo: fnSeleccionaObjetivo,
            contarPersonajes: fnContarPersonajes
        };
    }]);
