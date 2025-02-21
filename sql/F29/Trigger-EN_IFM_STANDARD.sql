DELIMITER / / CREATE TRIGGER eliminar_duplicados_EN_IFM_STANDARD
AFTER
INSERT
    ON EN_IFM_STANDARD FOR EACH ROW BEGIN IF EXISTS (
        SELECT
            1
        FROM
            EN_IFM_STANDARD
        WHERE
            id_puesto = NEW.id_puesto
            AND referencia_componente = NEW.referencia_componente
            AND linea = NEW.linea
            AND cantidad_a_mover = NEW.cantidad_a_mover
            AND F = NEW.F
            AND comments = NEW.comments
            AND distance_empty_zone = NEW.distance_empty_zone
            AND number_of_packages_loaded_at_once = NEW.number_of_packages_loaded_at_once
            AND loading_type = NEW.loading_type
            AND machine_used = NEW.machine_used
            AND speed = NEW.speed
            AND distancia_total = NEW.distancia_total
            AND numero_curvas = NEW.numero_curvas
            AND id < NEW.id
    ) THEN
DELETE FROM
    EN_IFM_STANDARD
WHERE
    id = NEW.id;

END IF;

END / / 
DELIMITER;




DELIMITER //

CREATE TRIGGER verificar_duplicados_EN_IFM_STANDARD
BEFORE INSERT ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM EN_IFM_STANDARD
        WHERE id_puesto = NEW.id_puesto
          AND referencia_componente = NEW.referencia_componente
          AND linea = NEW.linea
          AND F = NEW.F
    ) THEN
        SET NEW.id = NULL;
    END IF;
END//

DELIMITER ;


ALTER TABLE EN_IFM_STANDARD
ADD UNIQUE INDEX idx_unique (
    id_puesto,
    referencia_componente,
    linea,
    F
);