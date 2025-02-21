DELIMITER $$

CREATE TRIGGER `insertar_CDVBCDL_entre_zonas` 
BEFORE INSERT ON `EN_IFM_STANDARD`
FOR EACH ROW 
BEGIN
    IF NEW.numero_curvas IS NOT NULL AND NEW.frecuencia_recorrido IS NOT NULL THEN
        SET NEW.CDVB_CDL = NEW.numero_curvas * NEW.frecuencia_recorrido;
    ELSE
        SET NEW.CDVB_CDL = 0;
    END IF;
END$$

DELIMITER ;
