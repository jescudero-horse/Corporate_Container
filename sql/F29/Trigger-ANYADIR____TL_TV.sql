DELIMITER $$

CREATE TRIGGER `actualizar_TL_TV` 
BEFORE UPDATE ON `EN_IFM_STANDARD`
FOR EACH ROW 
BEGIN
    IF NEW.distancia_total IS NOT NULL AND NEW.cantidad_a_mover IS NOT NULL THEN
        SET NEW.TL_TV = NEW.distancia_total * NEW.cantidad_a_mover;
    ELSE
        SET NEW.TL_TV = 0;
    END IF;
END$$

DELIMITER ;
