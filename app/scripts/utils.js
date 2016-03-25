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
         * @param grupoA
         * @param grupoB
         * @param bonoA Bono a los reflejos para el grupo A
         * @param bonoB Bono a los reflejos para el grupo B
         * @returns {Array.<T>} Array con todos los personajes ordenados
         */
        function fnOrdenarPersonajesPorReflejos(grupoA, grupoB, bonoA, bonoB) {
            var mercenarios = grupoA.mercs.concat(grupoB.mercs);

            var ordenados = mercenarios.sort(function (a, b) {
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

            console.log(ordenados);
            return ordenados;
        }

        /**
         * Si se produce una emboscada, saca del array de pjs a los del grupo emboscado
         * @param personajes
         * @param idGrupoEmbosca
         * @returns {Array}
         */
        function fnEmboscada(personajes, idGrupoEmbosca) {
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
        }

        /**
         * Calcula la amenaza de cada personaje en función de diferentes cosas:
         *  nivel, cuánto destacan sus stats respecto de la media,
         * @param arrayPjs
         * @param idGrupoA
         * @returns {Array}
         */
        function fnCalcularAmenazaPersonajes(arrayPjs, idGrupoA) {
            var resultado = {
                "grupoA": [],
                "grupoB": []
            };

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
                    resultado.grupoA.push(pj);
                } else {
                    resultado.grupoB.push(pj);
                }
            });

            // Ordeno los arrays por amenaza
            resultado.grupoA = resultado.grupoA.sort(function (a, b) {
                return a.amenaza - b.amenaza;
            });
            resultado.grupoB = resultado.grupoB.sort(function (a, b) {
                return a.amenaza - b.amenaza;
            });

            return resultado;
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
            emboscada: fnEmboscada,
            calcularAmenazaPersonajes: fnCalcularAmenazaPersonajes
        };
    }]);
