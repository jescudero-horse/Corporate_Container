DELIMITER //
 
CREATE TRIGGER calcular_nuevo
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE actividad_minutos INT DEFAULT 0;
    DECLARE actividad_en_minutos_picadas INT DEFAULT 0;
    DECLARE tiempo_distancia_total INT DEFAULT 0;
 
    IF NEW.distancia_total IS NOT NULL
       AND NEW.cantidad_a_mover > 0
       AND NEW.numero_picadas > 0 THEN
 
        SET actividad_minutos = NEW.nuevo + ((NEW.distancia_total * 0.6 * NEW.cantidad_a_mover) / 100);
        SET actividad_en_minutos_picadas = actividad_minutos / NEW.numero_picadas;
        SET tiempo_distancia_total = (NEW.distancia_total * 0.6 * NEW.cantidad_a_mover) / 100;
 
    END IF;
    
    SET NEW.nuevo = COALESCE(actividad_minutos, 0);
    SET NEW.nuevo_picadas = COALESCE(actividad_en_minutos_picadas, 0);
    SET NEW.tiempo_distancia_total = COALESCE(tiempo_distancia_total, 0);
 
END //
 
DELIMITER ;
