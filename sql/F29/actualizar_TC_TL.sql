DELIMITER $$

CREATE TRIGGER `calcular_TC_TL`
BEFORE INSERT ON `EN_IFM_STANDARD`
FOR EACH ROW
BEGIN
    IF NEW.distancia_total IS NOT NULL AND NEW.speed IS NOT NULL AND NEW.cantidad_a_mover IS NOT NULL THEN
        SET NEW.TC_TL = NEW.distancia_total * NEW.speed * NEW.cantidad_a_mover;
    ELSE
        SET NEW.TC_TL = 0;
    END IF;
END$$

DELIMITER ;
